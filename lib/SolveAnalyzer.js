/* eslint react/no-access-state-in-setstate: off */

import {
	findCross,
	findRouxBlock,
	getInspectionTime,
	getNextStage,
	getNotation,
	getRotation,
	isStageSatisfied,
} from '~/lib/utils.js';
import Cube from 'cubejs';
import EventEmitter from 'events';
import MoveSequence from '~/lib/MoveSequence.js';
import config from '~/lib/config.js';
import isObject from 'lodash/isObject';
import {saveSolve} from '~/lib/db.js';
import sumBy from 'lodash/sumBy';
import uniq from 'lodash/uniq';

export default class SalveAnalyzer extends EventEmitter {
	constructor({mode = null, scramble}) {
		super();

		this.state = {
			mode, // 'cfop' | 'roux' | null (unknown)
			cross: null,
			cll: null,
			pll: null,
			oll: null,
			rouxBlock: null,
			cubeStage: 'unknown',
			stages: Object.assign(
				...config.stagesData.cfop.map(({id}) => ({
					[id]: {
						sequence: new MoveSequence(),
						time: null,
					},
				})),
				...config.stagesData.roux.map(({id}) => ({
					[id]: {
						sequence: new MoveSequence(),
						time: null,
					},
				})),
			),
			isOll2Look: false,
			pllLooks: [],
		};

		this.cube = new Cube();
		for (const move of scramble) {
			this.cube.move(getNotation(move));
		}

		this.scramble = scramble;
		this.turns = new MoveSequence([], {mode: 'raw'});
	}

	setState(newState) {
		for (const [key, value] of Object.entries(newState)) {
			if (!{}.hasOwnProperty.call(this.state, key)) {
				continue;
			}

			if (isObject(this.state[key]) || this.state[key] !== value) {
				Object.assign(this.state, {[key]: value});
				this.emit('statechange', key, value);
			}
		}
	}

	pushMoves(moves) {
		for (const move of moves) {
			this.cube.move(getNotation(move).replace(/2'$/, '2'));
			this.turns.push(move);
			this.state.stages[this.state.cubeStage].sequence.push(move);
			this.setState({
				stages: this.state.stages, // FIXME
			});

			if (this.state.cubeStage === 'unknown') {
				const cross = findCross(this.cube);
				const rouxBlock = findRouxBlock(this.cube);

				if (cross) {
					this.state.stages.unknown.time = move.time;
					this.setState({
						mode: 'cfop',
						cubeStage: 'f2l1',
						stages: this.state.stages, // FIXME
						cross,
					});
				} else if (rouxBlock) {
					this.state.stages.unknown.time = move.time;
					this.setState({
						mode: 'roux',
						cubeStage: 'block2',
						stages: this.state.stages, // FIXME
						rouxBlock,
					});
				}
				// fall through
			}

			if (this.state.mode !== null) {
				for (const stage of config.stagesData[this.state.mode].slice(1)) {
					if (this.state.cubeStage === stage.id) {
						const {result, oll, pll, cll} = isStageSatisfied({
							mode: this.state.mode,
							cube: this.cube,
							stage: stage.id,
							cross: this.state.cross,
							rouxBlock: this.state.rouxBlock,
						});

						if (result === true) {
							this.state.stages[stage.id].time = move.time;
							this.setState({
								cubeStage: getNextStage(stage.id),
								stages: this.state.stages, // FIXME
								...(stage.id === 'f2l4' ? {oll} : {}),
								...(stage.id === 'oll' ? {pll} : {}),
								...(stage.id === 'block2' ? {cll} : {}),
							});
						} else if (stage.id === 'oll' && !this.state.oll.isEdgeOriented && oll !== undefined && oll.isEdgeOriented) {
							this.setState({
								isOll2Look: true,
							});
						}

						if (pll !== undefined && pll.name !== 'PLL Skip') {
							const pllLooks = uniq([...this.state.pllLooks, pll.name]);
							this.setState({
								pllLooks,
							});
						}
					}
				}
			}
		}
	}

	getSerializedStages() {
		return config.stagesData[this.state.mode].map(({id}, index, stagesData) => {
			const stage = this.state.stages[id];

			if (!stage) {
				return undefined;
			}

			const previousStage = index === 0 ? undefined : this.state.stages[stagesData[index - 1].id];
			const time = stage.time - (previousStage ? previousStage.time : 0);

			if (!this.state.cross) {
				return {
					id,
					time,
					turns: stage.sequence.toObject(),
				};
			}

			const rotation = getRotation({from: this.state.cross, to: 'D'});
			const turns = stage.sequence.toObject({cross: this.state.cross});
			if (id === 'unknown' && rotation.amount !== 0) {
				turns.unshift(rotation);
			}

			return {
				id,
				time,
				turns,
			};
		}).filter((stage) => stage);
	}

	getMoveCount() {
		return sumBy(Object.values(this.state.stages), ({time = null, sequence}) => time === null ? 0 : sequence.length);
	}

	save({time, date, isError}) {
		const {inspection: ollInspection} = (this.state.stages.oll.time !== null && this.state.stages.oll.sequence.length !== 0)
			? getInspectionTime({stage: this.state.stages.oll, cross: this.state.cross, previousTime: this.state.stages.f2l4.time})
			: {inspection: null};

		const {inspection: pllInspection} = (this.state.stages.pll.time !== null && this.state.stages.pll.sequence.length !== 0)
			? getInspectionTime({stage: this.state.stages.pll, cross: this.state.cross, previousTime: this.state.stages.oll.time})
			: {inspection: null};

		const isXcross = (
			this.state.stages.f2l1 &&
			this.state.stages.f2l1.time !== null &&
			this.state.stages.f2l1.sequence.length === 0
		);

		return saveSolve({
			mode: this.state.mode,
			date,
			time,
			scramble: this.scramble,
			turns: this.turns.moves,
			stages: this.getSerializedStages(),
			isError,
			moveCount: this.getMoveCount(),
			crossFace: this.state.cross ? this.state.cross : null,
			isXcross,
			ollCase: this.state.oll ? this.state.oll.index : null,
			pllCase: this.state.pll ? this.state.pll.index : null,
			ollLooks: this.state.oll ? (this.state.isOll2Look ? 2 : 1) : null,
			pllLooks: this.state.pll ? this.state.pllLooks.length : null,
			ollInspection,
			pllInspection,
			cllCase: this.state.cll ? this.state.cll.index : null,
			rouxBlockSide: this.state.rouxBlock ? this.state.rouxBlock.side : null,
			rouxBlockBottom: this.state.rouxBlock ? this.state.rouxBlock.bottom : null,
		});
	}
}
