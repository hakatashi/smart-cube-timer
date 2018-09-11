/* eslint-env jest */

import {getRotationNotationFromFaces} from './utils.js';

describe('utils', () => {
	describe('getRotationNotationFromFaces', () => {
		test('works', () => {
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['U', 'F']})).toEqual('y');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['U', 'L']})).toEqual('y2');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['U', 'B']})).toEqual('y\'');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['B', 'R']})).toEqual('x');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['D', 'R']})).toEqual('x2');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['F', 'R']})).toEqual('x\'');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['R', 'D']})).toEqual('z');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['D', 'L']})).toEqual('x2 y2');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['L', 'U']})).toEqual('z\'');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['R', 'F']})).toEqual('x y');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['F', 'L']})).toEqual('x y2');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['L', 'B']})).toEqual('x y\'');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['L', 'F']})).toEqual('x\' y');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['B', 'L']})).toEqual('x\' y2');
			expect(getRotationNotationFromFaces({from: ['U', 'R'], to: ['R', 'B']})).toEqual('x\' y\'');
		});
	});
});
