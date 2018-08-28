<template>
	<v-container fill-height grid-list-lg text-xs-center>
		<v-layout v-if="!solve" align-center fill-height>
			<v-flex text-xs-center>
				<v-progress-circular
					:size="70"
					indeterminate
					color="purple"
				></v-progress-circular>
			</v-flex>
		</v-layout>
		<v-layout v-else>
			<v-flex class="solve-details">
				<div
					class="timer"
				>
					{{displayTime}}
				</div>
				<div
					class="solve-infos"
				>
					<span class="solve-info headline">
						{{moveCount}} turns
					</span>
					<span class="solve-info headline">
						{{speed}} tps
					</span>
				</div>
				<div
					class="scramble"
				>
					{{scrambleText}}
				</div>
				<stages
					:stages="solve.stages"
					:mode="solve.mode"
					:time="solve.time"
					:cross="solve._crossFace"
					:isXcross="solve._isXcross"
					:oll="solve._oll"
					:isOll2Look="solve._ollLooks === 2"
					:pll="solve._pll"
					:pllLooks="solve._pllLooks"
					:cll="solve._cll"
				></stages>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
	import sumBy from 'lodash/sumBy';
	import Stages from '~/components/Stages.vue';
	import MoveSequence from '~/lib/MoveSequence.js';
	import {getSolve} from '~/lib/db.js';
	import {formatTime} from '~/lib/utils.js';

	export default {
		components: {
			Stages,
		},
		data() {
			return {
				solve: null,
			};
		},
		async mounted() {
			const solve = await getSolve(this.$route.params.id);
			this.solve = solve;
			this.scrambleText = new MoveSequence(solve.scramble).toString();
		},
		computed: {
			displayTime() {
				return formatTime(this.solve && this.solve.time);
			},
			moveCount() {
				return sumBy(Object.values(this.solve.stages), ({turns}) => {
					return new MoveSequence(turns).length;
				});
			},
			speed() {
				if (this.solve.time === 0) {
					return (0).toFixed(2);
				}

				return (this.moveCount / (this.solve.time / 1000)).toFixed(2);
			},
		}
	}
</script>

<style>
	.solve-details {
		.scramble {
			max-width: 110vmin;
			font-size: 4vmin;
			line-height: 1.2em;
			margin: 0.5em auto 0;
		}

		.timer {
			font-size: 20vmin;
			font-weight: bold;
			line-height: 1em;
		}

		.solve-info {
			margin: 0 0.2rem;
		}
	}
</style>
