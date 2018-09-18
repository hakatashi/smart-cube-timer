<template>
	<v-container
		grid-list-lg
		reverse
	>
		<div>
			<h3>What can I do with this?</h3>
			<p>
				<a
					href="https://youtu.be/10ONTpO0mBM"
					target="_blank"
					rel="noopener"
				>
					https://youtu.be/10ONTpO0mBM
				</a>
			</p>
			<h3>What is "Inspection" and "Execution" on each stage?</h3>
			<p>Inspection is the time you only thinking what alg to execute on the current cube. It is duration to the first move that is not U face turn or the move not canceled by the following moves.</p>
			<p>Execution time is (total time) - (inspection time).</p>
			<h3>Release Notes?</h3>
			<p>
				See
				<a
					href="https://github.com/hakatashi/smart-cube-timer/commits/master"
					target="_blank"
					rel="noopener"
				>
					Commit Logs
				</a>.
			</p>
		</div>
	</v-container>
</template>

<script>
export default {
	head() {
		return {
			title: 'FAQ',
		};
	},
};
</script>

<style>
</style>
