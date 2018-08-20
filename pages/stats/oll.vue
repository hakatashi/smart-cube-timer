<template>
	<v-container fluid grid-list-md text-xs-center>
		<v-data-table
			:headers="headers"
			:items="cases"
			hide-actions
			class="elevation-1"
		>
			<template slot="items" slot-scope="props">
				<th class="row-header text-xs-left">{{props.item.name}}</th>
				<td class="text-xs-right">{{props.item.count}}</td>
				<td class="text-xs-right">{{props.item.averageTimeText}}</td>
				<td class="text-xs-right">{{props.item.averageInspectionText}}</td>
				<td class="text-xs-right">{{props.item.averageExecutionText}}</td>
			</template>
		</v-data-table>
	</v-container>
</template>

<script>
	import {getSolves} from '~/lib/db.js';
	import {formatTime, formatDate, idealTextColor} from '~/lib/utils.js';
	import {olls} from '~/lib/data.js';
	import meanBy from 'lodash/meanBy';

	export default {
		data() {
			return {
				headers: [
					{
						text: 'Case',
						align: 'left',
						value: 'index',
					},
					{
						text: 'Count',
						align: 'right',
						value: 'count',
					},
					{
						text: 'Time',
						align: 'right',
						value: 'averageTime',
					},
					{
						text: 'Insp.',
						align: 'right',
						value: 'averageInspection',
					},
					{
						text: 'Exec.',
						align: 'right',
						value: 'averageExecution',
					},
				],
				solves: [],
				cases: olls.map(([name]) => ({
					name,
					count: 0,
					averageTime: 0,
					averageInspection: 0,
					averageExecution: 0,
				})),
			};
		},
		async mounted() {
			this.solves = await getSolves();
			this.cases = this.cases.map(({name}, index) => {
				const solves = this.solves.filter(({_ollCase, isError}) => _ollCase === index && !isError);
				const averageTime = meanBy(solves, (solve) => solve._ollTime) || Infinity;

				return {
					index,
					name,
					count: solves.length,
					averageTime,
					averageTimeText: formatTime(averageTime),
					averageInspection: 0,
					averageInspectionText: '-',
					averageExecution: 0,
					averageExecutionText: '-',
				};
			});
		},
		computed: {
		},
		head() {
			return {
				title: 'OLL Stats',
			};
		},
	}
</script>

<style>
	tr {
		height: 32px !important;
	}

	td, th {
		padding: 0 0 0 8px !important;
		height: 32px !important;

		&:last-child {
			padding: 0 8px !important;
		}
	}

	.row-header {
		width: 100px;
		white-space: nowrap;
	}
</style>
