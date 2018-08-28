<template>
	<v-container
		fluid
		grid-list-md
		text-xs-center>
		<v-data-table
			:headers="headers"
			:items="cases"
			hide-actions
			class="elevation-1"
		>
			<template
				slot="items"
				slot-scope="props">
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
import {formatDate, formatTime, idealTextColor} from '~/lib/utils.js';
import {clls} from '~/lib/data.js';
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
			cases: clls.map(([name]) => ({
				name,
				count: null,
				averageTime: 0,
				averageTimeText: '',
				averageInspection: 0,
				averageInspectionText: '',
				averageExecution: 0,
				averageExecutionText: '',
			})),
		};
	},
	computed: {
	},
	async mounted() {
		this.solves = await getSolves();
		this.cases = this.cases.map(({name}, index) => {
			const solves = this.solves.filter(({_cllCase, isError}) => _cllCase === index && !isError);
			const averageTime = meanBy(solves, (solve) => solve._cllTime) || Infinity;

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
	head() {
		return {
			title: 'PLL Stats',
		};
	},
};
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
