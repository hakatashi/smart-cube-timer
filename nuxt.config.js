module.exports = {
	build: {},

	head: {
		link: [
			{rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css'},
		],
	},

	loading: {color: '#3B8070'},

	manifest: {
		theme_color: '#3B8070',
	},

	modules: [
		'@nuxtjs/pwa',
	],
};
