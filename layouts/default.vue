<template>
	<v-app>
		<v-navigation-drawer v-model="drawer" app>
			<v-list class="pt-0">
				<v-list-tile to="/" nuxt>
					<v-list-tile-content>
						<v-list-tile-title>
							Home
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
				<v-list-tile to="/solves" nuxt>
					<v-list-tile-content>
						<v-list-tile-title>
							Solves History
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-navigation-drawer>
		<v-toolbar dense app dark color="purple">
			<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title>
				<nuxt-link to="/" class="white--text">
					Smart Cube Timer
				</nuxt-link>
			</v-toolbar-title>
		</v-toolbar>
		<v-content>
			<nuxt/>
		</v-content>
		<v-footer app>
			<v-flex
				text-xs-center
				xs12
			>
				This timer is under development - <a href="https://github.com/hakatashi/smart-cube-timer" target="_blank">
					GitHub
				</a> - <a href="https://twitter.com/hakatashi" target="_blank">
					Twitter
				</a>
			</v-flex>
		</v-footer>
	</v-app>
</template>

<script>
export default {
	data() {
		return {
			drawer: null,
		};
	},
}
</script>

<style>
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
.v-chip.v-chip--small .v-avatar {
	height: 24px !important;
	margin-left: -13px;
	margin-right: 4px;
	min-width: 24px;
	width: 24px !important;
}
a {
	text-decoration: none;
}
</style>
