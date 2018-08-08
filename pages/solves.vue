<template>
	<v-container fluid grid-list-md>
		<v-data-table
			:headers="headers"
			:items="solvesInfo"
			:pagination.sync="pagination"
			:rows-per-page-items="perPage"
			class="elevation-1"
		>
			<template slot="headerCell" slot-scope="props">
				{{props.header.text}}
			</template>
			<template slot="items" slot-scope="props">
				<td><strong>{{props.item.timeText}}</strong></td>
				<td>{{props.item.cross}}</td>
				<td>{{props.item.f2l1}}</td>
				<td>{{props.item.f2l2}}</td>
				<td>{{props.item.f2l3}}</td>
				<td>{{props.item.f2l4}}</td>
				<td>{{props.item.oll}}</td>
				<td>{{props.item.pll}}</td>
				<td>{{props.item.auf}}</td>
				<td><span class="date-text">{{props.item.dateText}}</span></td>
			</template>
		</v-data-table>
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
	.solve-stage {
		height: 30px;
	}

	.date-text {
		display: inline-block;
		width: 5rem;
	}

	th {
		padding: 0 !important;
	}

	td {
		padding: 0 0 0 0.8em !important;
		text-align: right;
		height: 36px !important;
	}
</style>
