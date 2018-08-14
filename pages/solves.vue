<template>
	<v-container fluid grid-list-md text-xs-center>
		<v-layout row wrap>
			<v-flex v-for="solve in solvesInfo" :key="solve.id" xs12>
				<v-card class="solve">
					<v-card-text class="pa-0 subheading text-xs-left solve-headline">
						<strong>{{solve.timeText}}</strong>
						<small class="solve-times" :class="[`mode-${solve.mode}`]">
							<span
								v-for="stage, index in solve.stages"
								:key="stage.id"
							>
								<span v-if="index !== 0"> / </span>
								<span class="solve-time" :class="[`solve-time-${stage.id}`]">{{stage.time}}</span>
							</span>
						</small>
					</v-card-text>
					<v-layout class="solve-date pa-0">
						<v-chip
							v-for="info in solve.infos"
							:key="info.id"
							small
							:color="info.color.startsWith('#') ? null : info.color"
							:text-color="info.textColor.startsWith('#') ? null : info.textColor"
							:style="{
								backgroundColor: info.color.startsWith('#') ? info.color : '',
								color: info.textColor.startsWith('#') ? info.textColor : '',
							}"
							class="solve-chip"
						>
							{{info.text}}
						</v-chip>
						<v-spacer></v-spacer>
						<div>{{solve.dateText}}</div>
					</v-layout>
				</v-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
	import {getSolves} from '~/lib/db.js';
	import {formatTime, formatDate, idealTextColor} from '~/lib/utils.js';
	import {clls, olls, plls} from '~/lib/data.js';
	import config from '~/lib/config.js';

	export default {
		data() {
			return {
				solves: [],
			};
		},
		async mounted() {
			this.solves = await getSolves();
		},
		computed: {
			solvesInfo() {
				return this.solves.map((solve) => {
					const infos = [];

					if (solve.isError) {
						infos.push({
							id: 'error',
							text: 'Error',
							color: 'orange darken-4',
							textColor: 'white'
						});
					}

					if (solve._isXcross) {
						infos.push({
							id: 'xcross',
							text: 'XCross',
							color: '#4A148C',
							textColor: idealTextColor('#4A148C'),
						});
					}

					if (solve._ollCase !== null) {
						const [ollName] = olls[solve._ollCase];

						infos.push({
							id: 'ollcase',
							text: ollName,
							color: ollName === 'OLL Skip' ? 'yellow accent-4' : 'yellow lighten-2',
							textColor: '',
						});
					}

					if (solve._pllCase !== null) {
						const [pllName] = plls[solve._pllCase];

						infos.push({
							id: 'pllcase',
							text: pllName,
							color: pllName === 'PLL Skip' ? 'red accent-4' : 'red lighten-1',
							textColor: 'white',
						});
					}

					if (typeof solve._cllCase === 'number') {
						const [cllName] = clls[solve._cllCase];

						infos.push({
							id: 'cllcase',
							text: cllName,
							color: cllName === 'CLL Skip' ? 'brown darken-4' : 'brown darken-2',
							textColor: 'white',
						});
					}

					const stages = config.stagesData[solve.mode].map(({id}) => ({
						id,
						time: formatTime(solve[`_${id}Time`]),
					}));

					return {
						...solve,
						infos,
						timeText: formatTime(solve.time),
						dateText: formatDate(solve.date),
						stages,
					};
				})
			},
		},
		head() {
			return {
				title: 'History',
			};
		},
	}
</script>

<style>
	.solve {
		padding: 0.3em 0.8em;
	}

	.solve-headline {
		height: 22px;
	}

	.solve-times {
		font-size: 10px;
		margin-left: 1em;
		vertical-align: text-top;
	}

	.solve-time {
		position: relative;

		&::after {
			content: '';
			position: absolute;
			top: calc(100% - 0.1em);
			left: 0;
			right: 0;
			height: 2px;
			border-radius: 3px;
			opacity: 0.6;
		}

		.mode-cfop &.solve-time-unknown::after {
			background: #2196f3;
		}

		&.solve-time-f2l1::after, &.solve-time-f2l2::after, &.solve-time-f2l3::after, &.solve-time-f2l4::after {
			background: #3f51b5;
		}

		&.solve-time-oll::after {
			background: #ffeb3b;
		}

		&.solve-time-pll::after {
			background: #f44336;
		}

		&.solve-time-auf::after {
			background: #d0d0d0;
		}

		.mode-roux &.solve-time-unknown::after {
			background: #689f38;
		}

		&.solve-time-block2::after {
			background: #2e7d32;
		}

		&.solve-time-cll::after {
			background: #5d4037;
		}

		&.solve-time-lseo::after {
			background: #f57f17;
		}

		&.solve-time-lsep::after {
			background: #dd2c00;
		}
	}

	.solve-date {
		font-size: 10px;
		margin-bottom: 0 !important;
	}

	.solve-chip {
		height: 14px;
		font-size: 10px;
		margin-top: 0;
		margin-bottom: 0;
		z-index: 0;

		.v-chip__content {
			padding: 0 6px;
		}
	}
</style>
