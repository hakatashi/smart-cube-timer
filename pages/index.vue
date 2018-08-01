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
				<div class="tile is-parent is-3">
					<article class="tile is-child notification is-link">
						<p class="title">Cross</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification">
						<p class="title">F2L #1</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification">
						<p class="title">F2L #2</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification">
						<p class="title">F2L #3</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification">
						<p class="title">F2L #4</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification is-warning">
						<p class="title">OLL</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification is-danger">
						<p class="title">PLL</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
						</div>
					</article>
				</div>
				<div class="tile is-parent is-3">
					<article class="tile is-child notification is-primary">
						<p class="title">AUF</p>
						<p class="subtitle">02.33</p>
						<div class="content">
							R U' R' U
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
	import sample from 'lodash/sample';

	// Cube.initSolver();

	export default {
		data () {
			return {
				giiker: null,
				startTime: null,
				displayTime: '00.00',
				phase: 'scramble',
				isConnecting: false,
				description: 'Make sure GiiKER is solved state, and press "Connect Cube" to link cube.',
				placeholderMoves: [],
				scramble: null,
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
		},
		created() {
			this.cube = new Cube();
		},
		async mounted() {
			this.scramble = MoveSequence.fromScramble(sample(scrambles.sheets[0].scrambles));
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
						this.displayTime = '00.00';
						this.description = 'Now start solving when you\'re ready.'
					}
					return;
				}

				if (this.phase === 'inspect') {
					this.startTime = new Date();
					this.phase = 'solve';
					this.description = 'Good luck :)';
					this.interval = setInterval(this.onTick, 1000 / 30);
					return;
				}

				if (this.phase === 'solve') {
					console.log({
						ep: this.cube.ep,
						cp: this.cube.cp,
						eo: this.cube.eo,
						co: this.cube.co,
					});

					if (this.cube.isSolved()) {
						this.onTick();
						clearInterval(this.interval);
						this.phase = 'scramble';
						this.description = 'Nice!';
						this.scramble = MoveSequence.fromScramble(sample(scrambles.sheets[0].scrambles));
						this.placeholderMoves = this.scramble.moves.map((move) => ({...move}));
					}
				}
			},
			onTick() {
				const now = new Date();
				const time = now.getTime() - this.startTime.getTime();
				const second = Math.floor(time / 1000).toString().padStart(2, '0');
				const msecond = (Math.floor(time / 10) % 100).toString().padStart(2, '0');
				this.displayTime = `${second}:${msecond}`;
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
</style>
