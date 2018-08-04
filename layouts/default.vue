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
			drawer: true,
		};
	},
}
</script>

<style>
@import "https://fonts.googleapis.com/icon?family=Material+Icons";
.button--green {
	display: inline-block;
	border-radius: 4px;
	border: 1px solid #3b8070;
	color: #3b8070;
	background-color: white;
	outline: none;
	text-decoration: none;
	padding: 10px 30px;
}
.button--green[disabled] {
	color: dimgray;
	border-color: dimgray;
	background-color: lightgray;
}
.button--green:not([disabled]):hover {
	color: #fff;
	background-color: #3b8070;
}
.button--grey {
	display: inline-block;
	border-radius: 4px;
	border: 1px solid #35495e;
	color: #35495e;
	background-color: white;
	text-decoration: none;
	outline: none;
	padding: 10px 30px;
	margin-left: 15px;
}
.button--grey:hover {
	color: #fff;
	background-color: #35495e;
}
a {
	text-decoration: none;
}
</style>
