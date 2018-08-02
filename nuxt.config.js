module.exports = {
	router: {
		...(process.env.DEPLOY_ENV === 'GH_PAGES' ? {
			base: '/smart-cube-timer/',
		} : {}),
	},

	head: {
		link: [
			{rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.1/css/bulma.min.css'},
		],
		meta: [
			{name: 'viewport', content: 'width=device-width, initial-scale=1'},
		],
	},

	loading: {
		color: '#3B8070',
	},

	manifest: {
		theme_color: '#3B8070',
	},
};
