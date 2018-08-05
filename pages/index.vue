<template>
	<v-container fill-height grid-list-lg pa-0>
		<v-layout column fill-height ma-0>
			<v-flex class="controls">
				<v-alert v-if="description" type="success" v-model="isDescriptionShown">
					{{description}}
				</v-alert>
				<v-btn
					v-if="giiker === null"
					color="info"
					large
					:disabled="this.isConnecting"
					:loading="this.isConnecting"
					@click="onClickConnect"
				>
					Connect Cube
				</v-btn>
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
				<div
					v-if="phase === 'solve'"
					class="timer-controls"
				>
					<v-btn
						flat
						small
						color="error"
						class="ma-0"
						@click="onClickSolved"
					>
						It's solved!
					</v-btn>
				</div>
			</v-flex>
			<v-flex class="times" id="stages">
				<v-layout wrap>
					<v-flex
						v-for="stage in stagesInfo"
						lg3
						xs12
						:key="stage.id"
						:id="stage.id"
					>
						<v-card :dark="stage.dark" :color="stage.color" :class="stage.class">
							<v-card-title class="stage-info">
								<div :style="{width: '100%'}">
									<h2 class="display-1 font-weight-bold">
										{{stage.name}}
										<v-chip
											v-for="info in stage.infos"
											small
											:color="info.color.startsWith('#') ? null : info.color"
											:text-color="info.textColor.startsWith('#') ? null : info.textColor"
											:style="{
												backgroundColor: info.color.startsWith('#') ? info.color : '',
												color: info.textColor.startsWith('#') ? info.textColor : '',
											}"
										>
											<v-avatar
												v-if="info.avatar"
												:color="info.color.startsWith('#') ? null : info.color"
												:text-color="info.textColor.startsWith('#') ? null : info.textColor"
												class="darken-3"
											>
												{{info.avatar}}
											</v-avatar>
											{{info.text}}
										</v-chip>
									</h2>
									<v-layout class="stage-info headline ma-0">
										<strong :style="{color: 'inherit'}">{{stage.time}}</strong>
										<v-spacer></v-spacer>
										<div
											v-if="stage.moveCount !== null"
											class="subheading stage-info-right"
										>
											{{stage.moveCount}} turns
										</div>
										<div
											v-if="stage.speed !== null"
											class="subheading stage-info-right"
										>
											{{stage.speed}} tps
										</div>
									</v-layout>
									<div class="content">
										{{stage.sequenceText}}
									</div>
								</div>
							</v-card-title>
						</v-card>
					</v-flex>
				</v-layout>
			</v-flex>
		</v-layout>
		<v-snackbar
			v-model="isSnackbarShown"
			color="error"
			bottom
			multi-line
			:timeout="5000"
		>
			{{snackbar}}
			<v-btn
				flat
				@click="isSnackbarShown = false"
			>
				Close
			</v-btn>
		</v-snackbar>
	</v-container>
</template>

<script>
	import assert from 'assert';
	import GiiKER from 'giiker';
	import Cube from 'cubejs';
	import 'cubejs/lib/solve';
	import MoveSequence from '~/lib/MoveSequence.js';
	import scrambles from '~/lib/scrambles.json';
	import {findCross, formatTime, idealTextColor, isStageSatisfied, getNextStage, getRotationNotation} from '~/lib/utils.js';
	import config from '~/lib/config.js';
	import sample from 'lodash/sample';
	import uniq from 'lodash/uniq';

	const stagesData = [
		{
			id: 'cross',
			name: 'Cross',
			color: 'blue',
			dark: true,
		},
		{
			id: 'f2l1',
			name: 'F2L #1',
			color: 'indigo',
			dark: true,
		},
		{
			id: 'f2l2',
			name: 'F2L #2',
			color: 'indigo',
			dark: true,
		},
		{
			id: 'f2l3',
			name: 'F2L #3',
			color: 'indigo',
			dark: true,
		},
		{
			id: 'f2l4',
			name: 'F2L #4',
			color: 'indigo',
			dark: true,
		},
		{
			id: 'oll',
			name: 'OLL',
			color: 'yellow',
			dark: false,
		},
		{
			id: 'pll',
			name: 'PLL',
			color: 'red',
			dark: true,
		},
		{
			id: 'auf',
			name: 'AUF',
			color: 'grey lighten-2',
			dark: false,
		},
	];

	// Cube.initSolver();

	export default {
		data() {
			return {
				cross: null,
				giiker: null,
				startTime: null,
				time: 0,
				phase: 'scramble',
				isConnecting: false,
				description: 'Make sure GiiKER is solved state, and press "Connect Cube" to link cube.',
				isDescriptionShown: true,
				placeholderMoves: [],
				scramble: null,
				solveSequence: null,
				cubeStage: null,
				stages: {},
				oll: null,
				isOll2Look: false,
				pll: null,
				pllLooks: [],
				snackbar: '',
				isSnackbarShown: false,
				isFirstSolve: true,
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

				return stagesData.map(({id, name, color, dark}) => {
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
								avatar: '2',
								text: 'Look',
								color: 'green',
								textColor: 'white',
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
								avatar: this.pllLooks.length.toString(),
								text: 'Look',
								color: 'green',
								textColor: 'white',
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
							sequenceText = stage.sequence.toString({cross: this.cross});

							if (id === 'cross' && this.cross !== null) {
								const rotationNotation = getRotationNotation({from: this.cross, to: 'D'});
								if (rotationNotation !== '') {
									sequenceText = `${rotationNotation} ${sequenceText}`;
								}
							}
						}
					}

					const moveCount = (stage.time !== null && stage.sequence.length !== 0) ? stage.sequence.length : null;
					const speed = moveCount === null ? null : (moveCount / (deltaTime / 1000)).toFixed(2);

					return {
						id,
						name,
						infos,
						color,
						dark,
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
			onClickConnect() {
				if (this.isConnecting) {
					return;
				}

				this.isConnecting = true;

				GiiKER.connect().then((giiker) => {
					this.giiker = giiker;
					this.giiker.on('move', this.onGiikerMove)
					this.description = 'Follow the scramble.'
					this.isDescriptionShown = true;
				}, (error) => {
					this.isSnackbarShown = true;
					this.snackbar = error.message;
					this.isConnecting = false;
				});
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
						if (this.isFirstSolve) {
							this.description = 'Now start solving when you\'re ready.'
							this.isDescriptionShown = true;
						}
					}
					return;
				}

				if (this.phase === 'inspect') {
					this.startTime = new Date();
					this.phase = 'solve';
					this.description = null;
					this.isDescriptionShown = false;
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
						this.finishSolve();
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
			onClickSolved() {
				if (this.phase !== 'solve') {
					return;
				}

				this.finishSolve();
				this.cube.identity();
				this.description = 'Oops...';
				this.isDescriptionShown = true;
			},
			finishSolve() {
				clearInterval(this.interval);
				this.phase = 'scramble';
				this.isFirstSolve = false;
				this.scramble = MoveSequence.fromScramble(sample(scrambles.sheets[0].scrambles), {mode: 'reduction'});
				this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
				document.getElementById('stages').scrollTop = 0;
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
		flex: 1 1 0;
		padding-top: 0 !important;
		overflow-y: auto;
	}

	.stage-info-right {
		margin-left: 0.3rem;
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
