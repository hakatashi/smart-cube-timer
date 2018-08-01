<template>
	<section class="container">
		<div class="wrapper">
			<div class="controls">
				<div class="notification">
					{{description}}
				</div>
				<button
					v-if="giiker === null"
					:disabled="this.isConnecting"
					class="button is-primary is-large"
					:class="{'is-loading': this.isConnecting}"
					@click="onClickConnect"
				>
					Connect Cube
				</button>
				<div
					v-if="phase === 'scramble'"
					class="scramble"
				>
					<span v-for="move, index in scrambleMoves" :key="index" :style="{color: move.grey ? '#CCC' : ''}">
						{{move.text}}
					</span>
				</div>
				<div
					class="timer"
				>
					{{displayTime}}
				</div>
			</div>
			<div class="tile times">
				<div v-for="stage in stagesInfo" class="tile is-parent is-3" :key="stage.id">
					<article class="tile is-child notification" :class="stage.class">
						<p class="title">
							{{stage.name}}
							<span
								v-for="info in stage.infos"
								class="tag is-medium"
								:style="{backgroundColor: info.color, color: info.textColor}"
							>
								{{info.text}}
							</span>
						</p>
						<p class="subtitle">{{stage.time}}</p>
						<div class="content">
							{{stage.sequenceText}}
						</div>
					</article>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
	import assert from 'assert';
	import GiiKER from 'giiker';
	import Cube from 'cubejs';
	import 'cubejs/lib/solve';
	import MoveSequence from '~/lib/MoveSequence.js';
	import scrambles from '~/lib/scrambles.json';
	import {findCross, formatTime, idealTextColor, isStageSatisfied, getNextStage} from '~/lib/utils.js';
	import config from '~/lib/config.js';
	import sample from 'lodash/sample';

	const stagesData = [
		{
			id: 'cross',
			name: 'Cross',
			className: 'is-link',
		},
		{
			id: 'f2l1',
			name: 'F2L #1',
			className: '',
		},
		{
			id: 'f2l2',
			name: 'F2L #2',
			className: '',
		},
		{
			id: 'f2l3',
			name: 'F2L #3',
			className: '',
		},
		{
			id: 'f2l4',
			name: 'F2L #4',
			className: '',
		},
		{
			id: 'oll',
			name: 'OLL',
			className: 'is-warning',
		},
		{
			id: 'pll',
			name: 'PLL',
			className: 'is-danger',
		},
		{
			id: 'auf',
			name: 'AUF',
			className: 'is-primary',
		},
	];

	// Cube.initSolver();

	export default {
		data () {
			return {
				cross: null,
				giiker: null,
				startTime: null,
				time: 0,
				phase: 'scramble',
				isConnecting: false,
				description: 'Make sure GiiKER is solved state, and press "Connect Cube" to link cube.',
				placeholderMoves: [],
				scramble: null,
				solveSequence: null,
				cubeStage: null,
				stages: {},
				oll: null,
			};
		},
		computed: {
			scrambleMoves() {
				if (this.scramble === null) {
					return [];
				}

				assert(this.placeholderMoves.length >= this.scramble.moves.length);

				const greyedMovesCount = this.placeholderMoves.length - this.scramble.moves.length;

				return this.placeholderMoves.map((move, index) => {
					if (index < greyedMovesCount) {
						return {
							text: MoveSequence.moveToString(move),
							grey: true,
						};
					}

					const actualMove = this.scramble.moves[index - greyedMovesCount];

					if (index === greyedMovesCount) {
						if (move.face === actualMove.face) {
							return {
								text: MoveSequence.moveToString(move),
								grey: false,
							};
						}
					}

					return {
						text: MoveSequence.moveToString(actualMove),
						grey: false,
					};
				});
			},
			stagesInfo() {
				const stages = this.stages || {};
				let previousTime = 0;

				return stagesData.map(({id, name, className}) => {
					const stage = this.stages[id] || {};
					const deltaTime = (stage.time || this.time) - previousTime;
					if (stage.time) {
						previousTime = stage.time;
					}

					const infos = [];
					if (id === 'cross') {
						if (this.cross) {
							infos.push({
								text: `${config.faceColors[this.cross].name} Cross`,
								color: config.faceColors[this.cross].color,
								textColor: idealTextColor(config.faceColors[this.cross].color),
							});
						}
					}

					if (id === 'oll') {
						if (this.oll) {
							infos.push({
								text: this.oll.name,
								color: '#f5f5f5',
								textColor: idealTextColor('#f5f5f5'),
							});
						}
					}

					return {
						id,
						name,
						infos,
						class: className,
						sequenceText: stage.sequence ? stage.sequence.toString() : '--',
						time: formatTime(deltaTime),
					};
				});
			},
			displayTime() {
				return formatTime(this.time);
			},
		},
		created() {
			this.cube = new Cube();
		},
		async mounted() {
			this.scramble = MoveSequence.fromScramble(sample(scrambles.sheets[0].scrambles), {mode: 'reduction'});
			this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
		},
		methods: {
			async onClickConnect() {
				if (this.isConnecting) {
					return;
				}

				this.isConnecting = true;
				this.giiker = await GiiKER.connect();
				this.giiker.on('move', this.onGiikerMove)
				this.description = 'Follow the scramble.'
			},
			onGiikerMove(move) {
				const now = new Date();
				this.cube.move(move.notation);

				if (this.phase === 'scramble') {
					this.scramble.unshift({
						face: move.face,
						amount: -move.amount,
					});
					if (this.scramble.length > this.placeholderMoves.length) {
						this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
					}
					if (this.scramble.length === 0) {
						this.phase = 'inspect';
						this.cross = null;
						this.time = 0;
						this.description = 'Now start solving when you\'re ready.'
					}
					return;
				}

				if (this.phase === 'inspect') {
					this.startTime = new Date();
					this.phase = 'solve';
					this.description = 'Good luck :)';
					this.cubeStage = 'cross';
					this.stages = Object.assign(...stagesData.map(({id}) => ({
						[id]: {
							sequence: new MoveSequence(),
							firstMoveTime: null,
							time: null,
						},
					})));
					this.interval = setInterval(this.onTick, 1000 / 30);
					// fall through
				}

				if (this.phase === 'solve') {
					this.time = now.getTime() - this.startTime.getTime();

					this.stages[this.cubeStage].sequence.push(move);
					if (this.stages[this.cubeStage].firstMoveTime === null) {
						this.stages[this.cubeStage].firstMoveTime = this.time;
					}

					if (this.cubeStage === 'cross') {
						const cross = findCross(this.cube);
						if (cross) {
							this.cubeStage = 'f2l1';
							this.stages.cross.time = this.time;
							this.cross = cross;
							// fall through
						}
					}

					for (const stage of stagesData.slice(1)) {
						if (this.cubeStage === stage.id) {
							const {result, oll} = isStageSatisfied({cube: this.cube, stage: stage.id, cross: this.cross});
							if (result === true) {
								this.cubeStage = getNextStage(stage.id);
								this.stages[stage.id].time = this.time;
								if (stage.id === 'f2l4') {
									this.oll = oll;
								}
							}
						}
					}

					if (this.cube.isSolved()) {
						this.onTick();
						clearInterval(this.interval);
						this.phase = 'scramble';
						this.description = 'Nice!';
						this.scramble = MoveSequence.fromScramble(sample(scrambles.sheets[0].scrambles), {mode: 'reduction'});
						this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
					}
				}
			},
			onTick() {
				const now = new Date();
				this.time = now.getTime() - this.startTime.getTime();
			},
		},
		destroyed () {
			if (this.giiker) {
				this.giiker.removeListener('move', this.onGiikerMove);
			}
		}
	}
</script>

<style>
	.wrapper {
		width: 100%;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.controls {
		text-align: center;
	}

	.scramble {
		font-size: 8vmin;
		font-weight: bold;
		line-height: 1.2em;
		margin: 0.5em 0;
	}

	.timer {
		font-size: 20vmin;
		font-weight: bold;
		line-height: 1em;
	}

	.times {
		flex-wrap: wrap;
	}

	.notification .content {
		margin-top: -1.25rem;
	}
</style>
