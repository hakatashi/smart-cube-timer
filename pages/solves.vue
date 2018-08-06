<template>
	<v-container fluid grid-list-md>
		<v-data-iterator
			:items="solves"
			:pagination.sync="pagination"
			content-tag="v-layout"
			row
			wrap
		>
			<v-flex
				slot="item"
				slot-scope="props"
				xs6
				sm6
				md4
				lg3
			>
				<v-card>
					<v-card-title><h4>{{(props.item.time / 1000).toFixed(2)}}</h4></v-card-title>
				</v-card>
			</v-flex>
		</v-data-iterator>
	</v-container>
</template>

<script>
	import {getSolves} from '~/lib/db.js';

	export default {
		data() {
			return {
				solves: [],
				pagination: {rowsPerPage: 10},
			};
		},
		async mounted() {
			this.solves = await getSolves();
		},
	}
</script>

<style>
</style>
