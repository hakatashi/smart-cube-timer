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
				<td :style="{width: '30rem'}">{{props.item.dateText}}</td>
				<td><strong>{{props.item.timeText}}</strong></td>
				<td>{{props.item.cross}}</td>
				<td>{{props.item.f2l1}}</td>
				<td>{{props.item.f2l2}}</td>
				<td>{{props.item.f2l3}}</td>
				<td>{{props.item.f2l4}}</td>
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
						text: 'Date',
						align: 'left',
						value: 'date'
					},
					{
						text: 'Time',
						value: 'time'
					},
					{
						text: 'Cross',
						value: '_crossTime',
					},
					{
						text: 'F2L #1',
						value: '_f2l1Time',
					},
					{
						text: 'F2L #2',
						value: '_f2l2Time',
					},
					{
						text: 'F2L #3',
						value: '_f2l3Time',
					},
					{
						text: 'F2L #4',
						value: '_f2l4Time',
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
				}))
			},
		},
	}
</script>

<style>
	.solve-stage {
		height: 30px;
	}
</style>
