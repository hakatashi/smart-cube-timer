<template>
	<v-container
		grid-list-lg
		reverse
	>
		<v-layout
			row
			wrap
		>
			<v-flex
				xs12
				sm6
			>
				<v-card
					color="yellow"
					to="/stats/oll"
					nuxt
				>
					<v-card-title>
						<div class="headline">OLL</div>
					</v-card-title>
				</v-card>
			</v-flex>
			<v-flex
				xs12
				sm6
			>
				<v-card
					color="red"
					class="white--text"
					to="/stats/pll"
					nuxt
				>
					<v-card-title>
						<div class="headline">PLL</div>
					</v-card-title>
				</v-card>
			</v-flex>
			<v-flex
				xs12
				sm6
			>
				<v-card
					color="brown"
					class="white--text"
					to="/stats/cll"
					nuxt
				>
					<v-card-title>
						<div class="headline">CLL</div>
					</v-card-title>
				</v-card>
			</v-flex>
		</v-layout>
	</v-container>
</template>

<script>
export default {
	head() {
		return {
			title: 'Statistics',
		};
	},
};
</script>

<style>
</style>
