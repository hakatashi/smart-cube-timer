/* eslint react/no-access-state-in-setstate: off */

import {
	findCross,
	findRouxBlock,
	getNextStage,
	isStageSatisfied,
} from '~/lib/utils.js';
import Cube from 'cubejs';
import EventEmitter from 'events';
import MoveSequence from '~/lib/MoveSequence.js';
import config from '~/lib/config.js';
import isObject from 'lodash/isObject';
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
			this.cube.move(MoveSequence.moveToString(move));
		}
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

	addMoves(moves) {
		for (const move of moves) {
			this.cube.move(move.notation.replace(/2'$/, '2'));
			this.state.stages[this.state.cubeStage].sequence.push({time: move.time, ...move});
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
					// fall through
				} else if (rouxBlock) {
					this.state.stages.unknown.time = move.time;
					this.setState({
						mode: 'roux',
						cubeStage: 'block2',
						stages: this.state.stages, // FIXME
						rouxBlock,
					});
					// fall through
				}
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
}
