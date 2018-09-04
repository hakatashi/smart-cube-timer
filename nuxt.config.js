const precss = require('precss');
const importUrl = require('postcss-import-url');

module.exports = {
	mode: 'spa',

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
		color: '#9c27b0',
	},

	manifest: {
		name: 'Smart Cube Timer',
		short_name: 'Smart Cube Timer',
		theme_color: '#9c27b0',
		gcm_sender_id: '103953800507',
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
		// '@nuxtjs/pwa',
		['@nuxtjs/google-analytics', {
			id: 'UA-43802516-6',
			debug: {
				sendHitTask: process.env.NODE_ENV === 'production',
			},
		}],
	],
};
