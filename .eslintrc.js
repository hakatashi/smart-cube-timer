module.exports = {
	root: true,
	parserOptions: {
	  parser: 'babel-eslint',
	},
	env: {
		browser: true,
		node: true,
	},
	extends: [
		'@hakatashi',
		'plugin:vue/recommended',
	],
	// required to lint *.vue files
	plugins: [
		'vue',
	],
	// add your custom rules here
	rules: {
		'vue/html-indent': ['error', 'tab'],
		'node/no-unsupported-features': 'off',
		'max-params': 'off',
	},
	globals: {},
};
