<template>
	<v-container fluid grid-list-md text-xs-center>
		<v-layout row wrap>
			<v-flex v-for="solve in solvesInfo" :key="solve.date" xs3>
				<v-card class="solve">
					<v-card-text class="pa-0 subheading text-xs-center"><strong>{{solve.timeText}}</strong></v-card-text>
					<v-card-text class="solve-date pa-0 text-xs-right">{{solve.dateText}}</v-card-text>
				</v-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
	import {getSolves} from '~/lib/db.js';
	import config from '~/lib/config.js';
	import {formatTime, formatDate} from '~/lib/utils.js';

	export default {
		data() {
			return {
				headers: [
					{
						text: 'Time',
						value: 'time',
						align: 'right',
					},
					{
						text: 'Cross',
						value: '_crossTime',
						align: 'right',
					},
					{
						text: 'F2L #1',
						value: '_f2l1Time',
						align: 'right',
					},
					{
						text: 'F2L #2',
						value: '_f2l2Time',
						align: 'right',
					},
					{
						text: 'F2L #3',
						value: '_f2l3Time',
						align: 'right',
					},
					{
						text: 'F2L #4',
						value: '_f2l4Time',
						align: 'right',
					},
					{
						text: 'OLL',
						value: '_ollTime',
						align: 'right',
					},
					{
						text: 'PLL',
						value: '_pllTime',
						align: 'right',
					},
					{
						text: 'AUF',
						value: '_aufTime',
						align: 'right',
					},
					{
						text: 'Date',
						value: 'date',
						align: 'right',
					},
				],
				solves: [],
				pagination: {
					sortBy: 'date',
					descending: true,
				},
				perPage: [20, 40, {"text":"$vuetify.dataIterator.rowsPerPageAll","value":-1}],
				stagesData: Object.assign(...config.stagesData.map((stage) => ({[stage.id]: stage}))),
			};
		},
		async mounted() {
			this.solves = await getSolves();
		},
		computed: {
			solvesInfo() {
				return this.solves.map((solve) => ({
					...solve,
					timeText: formatTime(solve.time),
					dateText: formatDate(solve.date),
					cross: formatTime(solve._crossTime),
					f2l1: formatTime(solve._f2l1Time),
					f2l2: formatTime(solve._f2l2Time),
					f2l3: formatTime(solve._f2l3Time),
					f2l4: formatTime(solve._f2l4Time),
					oll: formatTime(solve._ollTime),
					pll: formatTime(solve._pllTime),
					auf: formatTime(solve._aufTime),
				}))
			},
		},
	}
</script>

<style>
	.solve {
		padding: 0.3em;
	}

	.solve-date {
		font-size: 10px;
	}
</style>
