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
					class="scramble"
				>
					{{scrambleText}}
				</div>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
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
		}
	}
</script>

<style>
	.solve-details {
		.scramble {
			max-width: 110vmin;
			font-size: 4vmin;
			line-height: 1.2em;
			margin: 0 auto;
		}

		.timer {
			font-size: 20vmin;
			font-weight: bold;
			line-height: 1em;
		}
	}
</style>
