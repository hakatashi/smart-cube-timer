const precss = require('precss');
const importUrl = require('postcss-import-url');

module.exports = {
	mode: 'spa',

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
			importUrl(),
		],
		extend(config) {
			// For sylvester
			config.node = {
				fs: 'empty',
			};
			config.externals = (config.externals || []).concat(['lapack']);
		},
	},

	modules: [
		['@nuxtjs/google-analytics', {
			id: 'UA-43802516-6',
			debug: {
				sendHitTask: process.env.NODE_ENV === 'production',
			},
		}],
	],
};
