/* eslint-env jest */
/* eslint quotes: off */

import {
	findRouxBlock,
	getRotationNotationFromFaces,
} from './utils.js';
import Cube from 'cubejs';

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

	describe('findRouxBlock', () => {
		// http://www.cubesolv.es/solve/1519
		test('find roux block', () => {
			const cube = new Cube();
			cube.move("B L2 B D2 B2 U L2 D2 R U L R2 D R D U2 L' U2 y' x R' U' r' z' U' M2 U' x z");
			expect(findRouxBlock(cube)).toEqual({side: 'U', bottom: 'R', bottomDirection: 'L'});
		});

		// http://www.cubesolv.es/solve/3222
		test('find roux block', () => {
			const cube = new Cube();
			cube.move("U F2 U' R2 U2 L2 U2 L' B' D2 U B2 L2 F' R B2 R2 F D' U' x y2 R' U R U' x2 R' U' R U x' y2");
			expect(findRouxBlock(cube)).toEqual({side: 'R', bottom: 'U', bottomDirection: 'D'});
		});

		// http://www.cubesolv.es/solve/1899
		test('find roux block', () => {
			const cube = new Cube();
			cube.move("L R' U L R F L D U R2 U B D2 U2 B F2 L D U2 L' R F D' B' F y x' U x' U U x L' U L U' R' U R L' U U L U' L' U L x y'");
			expect(findRouxBlock(cube)).toEqual({side: 'F', bottom: 'U', bottomDirection: 'R'});
		});
	});
});
