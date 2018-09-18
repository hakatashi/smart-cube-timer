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
	],
	// add your custom rules here
	rules: {
		'node/no-unsupported-features': 'off',
		'node/no-unsupported-features/es-syntax': 'off',
		'private-props/no-use-outside': 'off',
		'max-params': 'off',
		'no-underscore-dangle': 'off',
	},
	globals: {},
};
