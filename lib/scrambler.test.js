/* eslint-env jest */

import scrambler from './scrambler.rs';

describe('scrambler', () => {
	test('works', async () => {
		const {instance} = await scrambler();
		expect(instance.exports.add(1, 2)).toBe(3);
	});
});
