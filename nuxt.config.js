const precss = require('precss');

module.exports = {
	router: {
		...(process.env.DEPLOY_ENV === 'GH_PAGES' ? {
			base: '/smart-cube-timer/',
		} : {}),
	},

	head: {
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

	plugins: [
		'~/plugins/vuetify',
	],

	css: [
		'vuetify/dist/vuetify.css',
	],

	generate: {
		minify: {
			collapseWhitespace: true,
			removeComments: true,
			removeTagWhitespace: true,
		},
	},

	build: {
		postcss: [
			precss(),
		],
		extend(config) {
			// For sylvester
			config.node = {
				fs: 'empty',
			};
			config.externals = (config.externals || []).concat(['lapack']);
		},
	},
};
