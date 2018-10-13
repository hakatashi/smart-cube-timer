<template>
	<v-container
		fluid
		grid-list-md
		text-xs-center
	>
		<v-data-table
			:headers="headers"
			:items="cases"
			hide-actions
			class="elevation-1"
		>
			<template
				slot="items"
				slot-scope="props"
			>
				<th class="row-header text-xs-left">
					<span v-if="props.item.id === null">{{props.item.name}}</span>
					<a
						v-else
						:href="`http://algdb.net/puzzle/333/pll/${props.item.id}`"
						target="_blank"
						rel="noopener"
					>
						{{props.item.name}}
					</a>
				</th>
				<td class="text-xs-right">{{props.item.count}}</td>
				<td class="text-xs-right">{{props.item.averageTimeText}}</td>
				<td class="text-xs-right">{{props.item.averageInspectionText}}</td>
				<td class="text-xs-right">{{props.item.averageExecutionText}}</td>
			</template>
		</v-data-table>
	</v-container>
</template>

<script>
import {formatTime} from '~/lib/utils.js';
import {getPllStats} from '~/lib/db.js';
import {plls} from '~/lib/data.js';

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
			stats: [],
			cases: plls.map(([name, id]) => ({
				name,
				id,
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
		this.stats = await getPllStats();
		this.cases = this.cases.map(({name, id}, index) => {
			const stat = this.stats.find((s) => s.id === index);
			const averageTime = stat ? stat.times / stat.count : Infinity;
			const averageInspection = stat ? stat.inspectionTimes / stat.count : Infinity;
			const averageExecution = stat ? stat.executionTimes / stat.count : Infinity;

			return {
				index,
				name,
				id,
				count: stat ? stat.count : 0,
				averageTime,
				averageTimeText: formatTime(averageTime),
				averageInspection,
				averageInspectionText: formatTime(averageInspection),
				averageExecution,
				averageExecutionText: formatTime(averageExecution),
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
