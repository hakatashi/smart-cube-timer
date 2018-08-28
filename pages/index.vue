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
						@click="onClickReset"
					>
						Reset
					</v-btn>
				</div>
				<div
					v-if="phase === 'scramble' && !isFirstSolve"
					class="solve-infos"
				>
					<span class="solve-info subheading">
						{{moveCount}} turns
					</span>
					<span class="solve-info subheading">
						{{speed}} tps
					</span>
				</div>
			</v-flex>
			<v-flex class="times" id="stages">
				<stages
					:stages="stages"
					:mode="mode"
					:time="time"
					:cross="cross"
					:isXcross="isXcross"
					:oll="oll"
					:isOll2Look="isOll2Look"
					:pll="pll"
					:pllLooks="pllLooks"
					:cll="cll"
				></stages>
			</v-flex>
		</v-layout>
		<v-dialog
			v-model="isDialogOpen"
			max-width="400"
		>
			<v-card>
				<v-card-title class="headline">Your browser is not supported</v-card-title>
				<v-card-text>
					It seems your browser doesn't support Web Bluetooth API.
					So this timer cannot communicate with GiiKER and totally not works.
				</v-card-text>
				<v-card-text v-if="platform.startsWith('Win')">
					I guess you are using <strong>Windows</strong>.
					You can try Chrome Dev with new Bluetooth implementation but it's very beta.
					If you are so smart to try out beta, follow <a target="_blank" href="https://github.com/hakatashi/smart-cube-timer/wiki/Windows-Guide">this instruction</a> at your own risk.
				</v-card-text>
				<v-card-text v-if="platform.startsWith('iP')">
					I guess you are using <strong>{{platform}}</strong>.
					Some people says that this timer works with <a target="_blank" href="https://itunes.apple.com/us/app/webble/id1193531073">WebBLE browser</a> ($1.99) but I don't guarantee.
					Try at your own risk.
				</v-card-text>
				<v-card-text v-if="platform.startsWith('Mac')">
					I guess you are using <strong>Mac</strong>.
					Download <a target="_blank" href="https://www.google.com/chrome/">latest Google Chrome</a> and it should help.
				</v-card-text>
				<v-card-text v-if="platform.startsWith('Android') || platform.match(/linux/i)">
					I guess you are using <strong>Android</strong>.
					Download <a target="_blank" href="https://play.google.com/store/apps/details?id=com.android.chrome">latest Google Chrome</a> and it should help.
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn
						color="green darken-1"
						flat="flat"
						@click="isDialogOpen = false"
					>
						Close
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
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
	import NoSleep from 'nosleep.js';
	import sample from 'lodash/sample';
	import uniq from 'lodash/uniq';
	import sumBy from 'lodash/sumBy';
	import MoveSequence from '~/lib/MoveSequence.js';
	import scrambles from '~/lib/scrambles.json';
	import {
		findCross,
		findRouxBlock,
		formatTime,
		idealTextColor,
		isStageSatisfied,
		getNextStage,
		getRotation,
		getRotationNotation,
		getInspectionTime,
	} from '~/lib/utils.js';
	import config from '~/lib/config.js';
	import db, {saveSolve} from '~/lib/db.js';
	import Stages from '~/components/Stages.vue';

	export default {
		components: {
			Stages,
		},
		data() {
			return {
				platform: '',
				mode: 'cfop',
				cross: null,
				rouxBlock: null,
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
				cll: null,
				snackbar: '',
				isSnackbarShown: false,
				isFirstSolve: true,
				isDialogOpen: false,
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
			isXcross() {
				return this.stages.f2l1 && this.stages.f2l1.time !== null && this.stages.f2l1.sequence.length === 0;
			},
			displayTime() {
				return formatTime(this.time);
			},
			moveCount() {
				return sumBy(Object.values(this.stages), ({time = null, sequence}) => {
					return time === null ? 0 : sequence.length;
				});
			},
			speed() {
				if (this.time === 0) {
					return (0).toFixed(2);
				}

				return (this.moveCount / (this.time / 1000)).toFixed(2);
			},
		},
		created() {
			this.cube = new Cube();
			if (process.browser) {
				this.noSleep = new NoSleep();
			}
		},
		async mounted() {
			const scramble = sample(scrambles.sheets[0].scrambles);
			this.scramble = MoveSequence.fromScramble(scramble, {mode: 'reduction'});
			this.initialScramble = MoveSequence.fromScramble(scramble, {mode: 'reduction'});
			this.turns = new MoveSequence([], {mode: 'raw'});
			this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));

			this.isDialogOpen = !navigator.bluetooth && typeof BluetoothDevice === 'undefined';
			this.platform = navigator.platform;
		},
		methods: {
			onClickConnect() {
				if (this.isConnecting) {
					return;
				}

				if (this.noSleep) {
					this.noSleep.enable();
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
				this.cube.move(move.notation.replace(/2'$/, '2'));

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
					this.cross = null;
					this.cll = null;
					this.pll = null;
					this.oll = null;
					this.rouxBlock = null;
					this.phase = 'solve';
					this.description = null;
					this.isDescriptionShown = false;
					this.cubeStage = 'unknown';
					this.stages = Object.assign(
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
					);
					this.isOll2Look = false;
					this.pllLooks = [];
					this.interval = setInterval(this.onTick, 1000 / 30);
					this.scrollToStage();
					// fall through
				}

				if (this.phase === 'solve') {
					this.time = now.getTime() - this.startTime.getTime();
					this.turns.push({time: this.time, ...move})

					this.stages[this.cubeStage].sequence.push({time: this.time, ...move});

					if (this.cubeStage === 'unknown') {
						const cross = findCross(this.cube);
						const rouxBlock = findRouxBlock(this.cube);
						if (cross) {
							this.mode = 'cfop';
							this.cubeStage = 'f2l1';
							this.scrollToStage();
							this.stages.unknown.time = this.time;
							this.cross = cross;
							// fall through
						} else if (rouxBlock) {
							this.mode = 'roux';
							this.cubeStage = 'block2';
							this.scrollToStage();
							this.stages.unknown.time = this.time;
							this.rouxBlock = rouxBlock;
							// fall through
						}
					}

					for (const stage of config.stagesData[this.mode].slice(1)) {
						if (this.cubeStage === stage.id) {
							const {result, oll, pll, cll} = isStageSatisfied({
								mode: this.mode,
								cube: this.cube,
								stage: stage.id,
								cross: this.cross,
								rouxBlock: this.rouxBlock,
							});

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
								if (stage.id === 'block2') {
									this.cll = cll;
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
						this.finishSolve({isError: false});
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
			onClickReset() {
				if (this.phase !== 'solve') {
					return;
				}

				this.finishSolve({isError: true});
				this.cube.identity();
				this.description = 'Oops...';
				this.isDescriptionShown = true;
			},
			finishSolve({isError}) {
				const {inspection: ollInspection} = (this.stages.oll.time !== null && this.stages.oll.sequence.length !== 0) ?
					getInspectionTime({stage: this.stages.oll, cross: this.cross, previousTime: this.stages.f2l4.time}) :
					{inspection: null};

				const {inspection: pllInspection} = (this.stages.pll.time !== null && this.stages.pll.sequence.length !== 0) ?
					getInspectionTime({stage: this.stages.pll, cross: this.cross, previousTime: this.stages.oll.time}) :
					{inspection: null};

				saveSolve({
					mode: this.mode,
					date: this.startTime.getTime(),
					time: this.time,
					scramble: this.initialScramble.moves,
					turns: this.turns.moves,
					stages: this.getSerializedStages(),
					isError,
					moveCount: this.moveCount,
					crossFace: this.cross ? this.cross : null,
					isXcross: this.isXcross,
					ollCase: this.oll ? this.oll.index : null,
					pllCase: this.pll ? this.pll.index : null,
					ollLooks: this.oll ? (this.isOll2Look ? 2 : 1) : null,
					pllLooks: this.pll ? this.pllLooks.length : null,
					ollInspection,
					pllInspection,
					cllCase: this.cll ? this.cll.index : null,
					rouxBlockSide: this.rouxBlock ? this.rouxBlock.side : null,
					rouxBlockBottom: this.rouxBlock ? this.rouxBlock.bottom : null,
				});

				clearInterval(this.interval);
				this.phase = 'scramble';
				this.isFirstSolve = false;
				const scramble = sample(scrambles.sheets[0].scrambles);
				this.scramble = MoveSequence.fromScramble(scramble, {mode: 'reduction'});
				this.initialScramble = MoveSequence.fromScramble(scramble, {mode: 'reduction'});
				this.turns = new MoveSequence([], {mode: 'raw'});
				this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
				document.getElementById('stages').scrollTop = 0;
			},
			getSerializedStages() {
				return config.stagesData[this.mode].map(({id}, index, stagesData) => {
					const stage = this.stages[id];

					if (!stage) {
						return undefined;
					}

					const previousStage = index === 0 ? undefined : this.stages[stagesData[index - 1].id];
					const time = stage.time - (previousStage ? previousStage.time : 0);

					if (!this.cross) {
						return {
							id,
							time,
							turns: stage.sequence.toObject(),
						};
					}

					const rotation = getRotation({from: this.cross, to: 'D'});
					const turns = stage.sequence.toObject({cross: this.cross});
					if (id === 'unknown' && rotation.amount !== 0) {
						turns.unshift(rotation)
					}

					return {
						id,
						time,
						turns,
					};
				}).filter((stage) => stage);
			},
		},
		destroyed() {
			if (this.interval) {
				clearInterval(this.interval);
			}
			if (this.giiker) {
				this.giiker.removeListener('move', this.onGiikerMove);
			}
			if (this.noSleep) {
				this.noSleep.disable();
			}
		},
		head() {
			return {
				title: 'Smart Cube Timer',
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
		max-width: 110vmin;
		font-size: 8vmin;
		font-weight: bold;
		line-height: 1.2em;
		margin: 0 auto;
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

	.solve-info {
		margin: 0 0.2rem;
	}

	.inspection-time {
		font-size: 70%;
		opacity: 0.7;
		display: flex;
		line-height: 1.5em;
		margin-left: 0.5em;
	}

	.time-info {
		position: relative;
		align-self: flex-end;
	}

	.time-spacer {
		width: 0.8em;
		text-align: center;
		align-self: flex-end;
	}
</style>
