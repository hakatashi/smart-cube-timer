<template>
	<section class="container">
		<div class="wrapper">
			<div class="controls">
				<div v-if="description" class="notification">
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
			<div class="tile times" id="stages">
				<div v-for="stage in stagesInfo" class="tile is-parent is-3" :key="stage.id" :id="stage.id">
					<article class="tile is-child notification" :class="stage.class">
						<p class="title is-marginless">
							{{stage.name}}
							<span
								v-for="info in stage.infos"
								class="tag"
								:class="{'is-medium': stage.infos.length === 1}"
								:style="{backgroundColor: info.color, color: info.textColor}"
							>
								{{info.text}}
							</span>
						</p>
						<div class="level is-mobile is-marginless">
							<div class="level-left">
								<div class="level-item">
									<div class="subtitle"><strong :style="{color: 'inherit'}">{{stage.time}}</strong></div>
								</div>
							</div>
							<div class="level-right">
								<div
									v-if="stage.moveCount !== null"
									class="level-item"
								>
									{{stage.moveCount}} turns
								</div>
								<div
									v-if="stage.speed !== null"
									class="level-item"
								>
									{{stage.speed}} tps
								</div>
							</div>
						</div>
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
	import uniq from 'lodash/uniq';

	const stagesData = [
		{
			id: 'cross',
			name: 'Cross',
			className: 'is-info',
		},
		{
			id: 'f2l1',
			name: 'F2L #1',
			className: 'is-link',
		},
		{
			id: 'f2l2',
			name: 'F2L #2',
			className: 'is-link',
		},
		{
			id: 'f2l3',
			name: 'F2L #3',
			className: 'is-link',
		},
		{
			id: 'f2l4',
			name: 'F2L #4',
			className: 'is-link',
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
			className: '',
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
				isOll2Look: false,
				pll: null,
				pllLooks: [],
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

				const isXcross = this.stages.f2l1 && this.stages.f2l1.time !== null && this.stages.f2l1.sequence.length === 0;

				return stagesData.map(({id, name, className}) => {
					const stage = this.stages[id] || {time: null};
					const deltaTime = previousTime === null ? 0 : (stage.time || this.time) - previousTime;
					previousTime = stage.time;

					const infos = [];
					if (id === 'cross') {
						if (this.cross) {
							infos.push({
								text: `${config.faceColors[this.cross].name} Cross`,
								color: config.faceColors[this.cross].color,
								textColor: idealTextColor(config.faceColors[this.cross].color),
							});
						}

						if (isXcross) {
							infos.push({
								text: `XCross`,
								color: '#4A148C',
								textColor: idealTextColor('#4A148C'),
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
						if (this.isOll2Look) {
							infos.push({
								text: '2-Look',
								color: '#F8BBD0',
								textColor: idealTextColor('#F8BBD0'),
							});
						}
					}

					if (id === 'pll') {
						if (this.pll) {
							infos.push({
								text: this.pll.name,
								color: '#FFEE58',
								textColor: idealTextColor('#FFEE58'),
							});
						}
						if (this.pllLooks.length > 1) {
							infos.push({
								text: `${this.pllLooks.length}-Look`,
								color: '#F8BBD0',
								textColor: idealTextColor('#F8BBD0'),
							});
						}
					}

					let sequenceText = '--';

					if (stage.sequence) {
						if (stage.sequence.length === 0) {
							if (stage.time !== null && stage.sequence.length === 0) {
								sequenceText = '(Skipped)';
							}
						} else {
							sequenceText = stage.sequence.toString();
						}
					}

					const moveCount = (stage.time !== null && stage.sequence.length !== 0) ? stage.sequence.length : null;
					const speed = moveCount === null ? null : (moveCount / (deltaTime / 1000)).toFixed(2);

					return {
						id,
						name,
						infos,
						class: className,
						sequenceText,
						time: formatTime(deltaTime),
						moveCount,
						speed,
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
					this.description = null;
					this.cubeStage = 'cross';
					this.stages = Object.assign(...stagesData.map(({id}) => ({
						[id]: {
							sequence: new MoveSequence(),
							firstMoveTime: null,
							time: null,
						},
					})));
					this.isOll2Look = false;
					this.pllLooks = [];
					this.interval = setInterval(this.onTick, 1000 / 30);
					this.scrollToStage();
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
							this.scrollToStage();
							this.stages.cross.time = this.time;
							this.cross = cross;
							// fall through
						}
					}

					for (const stage of stagesData.slice(1)) {
						if (this.cubeStage === stage.id) {
							const {result, oll, pll} = isStageSatisfied({cube: this.cube, stage: stage.id, cross: this.cross});

							if (result === true) {
								this.cubeStage = getNextStage(stage.id);
								this.scrollToStage();
								this.stages[stage.id].time = this.time;
								if (stage.id === 'f2l4') {
									this.oll = oll;
								}
								if (stage.id === 'oll') {
									this.pll = pll;
								}
							} else {
								if (stage.id === 'oll' && !this.oll.isEdgeOriented && oll !== undefined && oll.isEdgeOriented) {
									this.isOll2Look = true;
								}
							}

							if (pll !== undefined && pll.name !== 'PLL Skip') {
								this.pllLooks = uniq([...this.pllLooks, pll.name]);
							}
						}
					}

					if (this.cube.isSolved()) {
						clearInterval(this.interval);
						this.phase = 'scramble';
						this.scramble = MoveSequence.fromScramble(sample(scrambles.sheets[0].scrambles), {mode: 'reduction'});
						this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
						document.getElementById('stages').scrollTop = 0;
					}
				}
			},
			onTick() {
				const now = new Date();
				this.time = now.getTime() - this.startTime.getTime();
			},
			scrollToStage() {
				const element = document.getElementById(this.cubeStage);
				if (element) {
					element.scrollIntoView({block: 'end', inline: 'nearest', behavior: 'smooth'});
				}
			},
		},
		destroyed () {
			if (this.giiker) {
				this.giiker.removeListener('move', this.onGiikerMove);
			}
		},
		head() {
			return {
				title: 'Smart Cube Timer - Record your solves with advanced stats',
			};
		},
	}
</script>

<style>
	.wrapper {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.controls {
		text-align: center;
		flex: 0 0 auto;
	}

	.scramble {
		font-size: 8vmin;
		font-weight: bold;
		line-height: 1.2em;
	}

	.timer {
		font-size: 20vmin;
		font-weight: bold;
		line-height: 1em;
	}

	.times {
		flex-wrap: wrap;
		flex: 1 1 0;
		overflow-y: auto;
		min-height: auto;
	}

	.title .tag {
		margin-right: 0.3em;
		vertical-align: top;
	}

	.padding {
		padding: 0.8rem 1.2rem;
	}

	.level-right .level-item:last-child {
		margin-right: 0;
	}

	.notification {
		padding: 0.8rem 1.2rem;
	}

	.tile.is-parent {
		padding: 0.5rem 1rem;
	}
</style>
