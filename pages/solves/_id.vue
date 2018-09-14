<template>
	<v-container fill-height grid-list-lg text-xs-center>
		<v-layout v-if="!solve" align-center fill-height>
			<v-flex text-xs-center>
				<v-progress-circular
					:size="70"
					indeterminate
					color="purple"
				/>
			</v-flex>
		</v-layout>
		<v-layout v-else>
			<v-flex class="solve-details">
				<div class="timer">
					<v-btn
						icon
						flat
						disabled
						class="ma-0"
					/>
					{{displayTime}}
					<v-dialog v-model="isDeleteDialogOpen">
						<v-btn
							slot="activator"
							icon
							flat
							color="red lighten-2"
							class="ma-0"
						>
							<v-icon dark>delete</v-icon>
						</v-btn>
						<v-card>
							<v-card-text>
								Delete solve?
							</v-card-text>
							<v-divider/>
							<v-card-actions>
								<v-spacer/>
								<v-btn
									color="primary"
									flat
									@click="isDeleteDialogOpen = false"
								>
									Cancel
								</v-btn>
								<v-btn
									color="red lighten-1"
									flat
									@click="onClickDelete"
								>
									Delete
								</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
				</div>
				<div class="solve-infos">
					<span class="solve-info headline">
						{{moveCount}} turns
					</span>
					<span class="solve-info headline">
						{{speed}} tps
					</span>
				</div>
				<div class="scramble">
					{{scrambleText}}
				</div>
				<stages
					:replay="true"
					:stages="stages"
					:mode="solve.mode"
					:time="solve.time"
					:cross="solve._crossFace"
					:is-xcross="solve._isXcross"
					:oll="oll"
					:is-oll2look="solve._ollLooks === 2"
					:pll="pll"
					:pll-looks="solve._pllLooks"
					:roux-block="solve._rouxBlock"
					:cll="cll"
					:scramble-text="scrambleText"
				/>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
import {clls, olls, plls} from '~/lib/data.js';
import {deleteSolve, getSolve} from '~/lib/db.js';
import {faces, formatTime} from '~/lib/utils.js';
import MoveSequence from '~/lib/MoveSequence.js';
import Stages from '~/components/Stages.vue';
import sumBy from 'lodash/sumBy';

export default {
	components: {
		Stages,
	},
	data() {
		return {
			solve: null,
			isDeleteDialogOpen: false,
		};
	},
	computed: {
		displayTime() {
			return formatTime(this.solve && this.solve.time);
		},
		moveCount() {
			return sumBy(Object.values(this.solve.stages), ({turns}) => new MoveSequence(turns).length);
		},
		speed() {
			if (this.solve.time === 0) {
				return (0).toFixed(2);
			}

			return (this.moveCount / (this.solve.time / 1000)).toFixed(2);
		},
		stages() {
			let timeSum = 0;
			return Object.assign(...this.solve.stages.map((stage) => {
				timeSum += stage.time;
				return {
					[stage.id]: {
						...stage,
						// Why abnormal faces are recorded in db?
						sequence: new MoveSequence(stage.turns.filter(({face}) => faces.includes(face))),
						time: timeSum,
					},
				};
			}));
		},
		oll() {
			if (this.solve._ollCase === null) {
				return null;
			}

			const [name] = olls[this.solve._ollCase];
			return {
				index: this.solve._ollCase,
				name,
			};
		},
		pll() {
			if (this.solve._pllCase === null) {
				return null;
			}

			const [name] = plls[this.solve._pllCase];
			return {
				index: this.solve._pllCase,
				name,
			};
		},
		cll() {
			if (this.solve._cllCase === null) {
				return null;
			}

			const [name] = clls[this.solve._cllCase];
			return {
				index: this.solve._cllCase,
				name,
			};
		},
	},
	async mounted() {
		const solve = await getSolve(this.$route.params.id);
		this.solve = {
			...solve,
			_rouxBlock: solve._rouxBlockSide ? {side: solve._rouxBlockSide, bottom: solve._rouxBlockBottom} : null,
		};
		this.scrambleText = new MoveSequence(solve.scramble).toString();
	},
	methods: {
		async onClickDelete() {
			await deleteSolve(this.solve.id);
			this.$router.push({
				path: '/solves',
			});
		},
	},
};
</script>

<style>
	.solve-details {
		.scramble {
			max-width: 110vmin;
			font-size: 4vmin;
			line-height: 1.2em;
			margin: 0.3em auto 0;
		}

		.timer {
			font-size: 20vmin;
			font-weight: bold;
			line-height: 0.9em;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.timer .v-dialog__activator {
			display: flex;
		}

		.solve-info {
			margin: 0 0.2rem;
		}
	}
</style>
