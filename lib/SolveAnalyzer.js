/* eslint react/no-access-state-in-setstate: off */

import {
	findCross,
	findRouxBlock,
	getInspectionTime,
	getNextStage,
	getNotation,
	getOrientation,
	isStageSatisfied,
} from '~/lib/utils.js';
import Cube from 'cubejs';
import EventEmitter from 'events';
import MoveSequence from '~/lib/MoveSequence.js';
import config from '~/lib/config.js';
import isObject from 'lodash/isObject';
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
						orientation: null,
					},
				})),
				...config.stagesData.roux.map(({id}) => ({
					[id]: {
						sequence: new MoveSequence(),
						time: null,
						orientation: null, // estimated cube orientation {down, left} at the end of each stage (for roux only)
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
					this.state.stages.unknown.orientation = getOrientation({
						from: cross,
						to: 'D',
					});
					this.setState({
						mode: 'cfop',
						cubeStage: 'f2l1',
						stages: this.state.stages, // FIXME
						cross,
					});
				} else if (rouxBlock) {
					this.state.stages.unknown.time = move.time;
					this.state.stages.unknown.orientation = {
						left: rouxBlock.side,
						down: rouxBlock.bottomDirection,
					};
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
						const {result, oll, pll, cll, bottomDirection} = isStageSatisfied({
							mode: this.state.mode,
							cube: this.cube,
							stage: stage.id,
							cross: this.state.cross,
							rouxBlock: this.state.rouxBlock,
						});

						if (result === true) {
							this.state.stages[stage.id].time = move.time;
							if (this.state.mode === 'roux') {
								this.state.stages[stage.id].orientation = {
									left: this.state.rouxBlock.side,
									down: bottomDirection,
								};
							} else if (this.state.mode === 'cfop') {
								this.state.stages[stage.id].orientation = getOrientation({
									from: this.state.cross,
									to: 'D',
								});
							}
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
		return config.stagesData[this.state.mode || 'cfop'].map(({id}, index, stagesData) => {
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
					orientation: stage.orientation,
				};
			}

			const turns = stage.sequence.toObject({cross: this.state.cross});

			return {
				id,
				time,
				turns,
				orientation: stage.orientation,
			};
		}).filter((stage) => stage);
	}

	getMoveCount() {
		return sumBy(Object.values(this.state.stages), ({time = null, sequence}) => time === null ? 0 : sequence.length);
	}

	toSolveEntry({time, date, isError}) {
		const {inspection: ollInspection} = (this.state.stages.oll.time !== null && this.state.stages.oll.sequence.length !== 0)
			? getInspectionTime({
				stage: this.state.stages.oll,
				cross: this.state.cross,
				previousTime: this.state.stages.f2l4.time,
			})
			: {inspection: null};

		const {inspection: pllInspection} = (this.state.stages.pll.time !== null && this.state.stages.pll.sequence.length !== 0)
			? getInspectionTime({
				stage: this.state.stages.pll,
				cross: this.state.cross,
				previousTime: this.state.stages.oll.time,
			})
			: {inspection: null};

		const {inspection: cllInspection} = (this.state.stages.cll.time !== null && this.state.stages.cll.sequence.length !== 0)
			? getInspectionTime({
				stage: this.state.stages.cll,
				cross: this.state.stages.block2.orientation.down,
				previousTime: this.state.stages.block2.time,
			})
			: {inspection: null};

		const isXcross = (
			this.state.stages.f2l1 &&
			this.state.stages.f2l1.time !== null &&
			this.state.stages.f2l1.sequence.length === 0
		);

		const moveCount = this.getMoveCount();
		const speed = moveCount / (time / 1000);
		const stages = this.getSerializedStages();

		const [
			unknownTime,
			f2l1Time,
			f2l2Time,
			f2l3Time,
			f2l4Time,
			ollTime,
			pllTime,
			aufTime,
			block2Time,
			cllTime,
			lseoTime,
			lsepTime,
		] = [
			'unknown',
			'f2l1',
			'f2l2',
			'f2l3',
			'f2l4',
			'oll',
			'pll',
			'auf',
			'block2',
			'cll',
			'lseo',
			'lsep',
		].map((stageId) => {
			const stage = stages.find((s) => s.id === stageId);
			if (stage === undefined) {
				return null;
			}
			return stage.time;
		});

		return {
			mode: this.state.mode,
			date,
			time,
			scramble: this.scramble,
			turns: this.turns.moves,
			stages,
			isError,
			_moveCount: this.getMoveCount(),
			_crossFace: this.state.cross ? this.state.cross : null,
			_isXcross: isXcross,
			_ollCase: this.state.oll ? this.state.oll.index : null,
			_pllCase: this.state.pll ? this.state.pll.index : null,
			_cllCase: this.state.cll ? this.state.cll.index : null,
			_ollLooks: this.state.oll ? (this.state.isOll2Look ? 2 : 1) : null,
			_pllLooks: this.state.pll ? this.state.pllLooks.length : null,
			_rouxBlockSide: this.state.rouxBlock ? this.state.rouxBlock.side : null,
			_rouxBlockBottom: this.state.rouxBlock ? this.state.rouxBlock.bottom : null,
			_speed: speed,
			_ollInspection: ollInspection,
			_pllInspection: pllInspection,
			_cllInspection: cllInspection,
			_unknownTime: unknownTime,
			_f2l1Time: f2l1Time,
			_f2l2Time: f2l2Time,
			_f2l3Time: f2l3Time,
			_f2l4Time: f2l4Time,
			_ollTime: ollTime,
			_pllTime: pllTime,
			_aufTime: aufTime,
			_block2Time: block2Time,
			_cllTime: cllTime,
			_lseoTime: lseoTime,
			_lsepTime: lsepTime,
		};
	}
}
