/* eslint-env jest */
/* eslint quotes: off, no-console: off */

import MoveSequence from './MoveSequence.js';
import {getRotationNotationFromFaces} from './utils.js';

describe('MoveSequence', () => {
	describe('.fromScramble', () => {
		test('parse notation of rotation', () => {
			const sequence = MoveSequence.fromScramble('R L U D B F');
			expect(sequence.moves).toEqual([
				{face: 'R', amount: 1},
				{face: 'L', amount: 1},
				{face: 'U', amount: 1},
				{face: 'D', amount: 1},
				{face: 'B', amount: 1},
				{face: 'F', amount: 1},
			]);
		});

		test('parse notation of inverse rotation', () => {
			const sequence = MoveSequence.fromScramble("R' L' U' D' B' F'");
			expect(sequence.moves).toEqual([
				{face: 'R', amount: -1},
				{face: 'L', amount: -1},
				{face: 'U', amount: -1},
				{face: 'D', amount: -1},
				{face: 'B', amount: -1},
				{face: 'F', amount: -1},
			]);
		});

		test('parse notation of double rotation', () => {
			const sequence = MoveSequence.fromScramble('R2 L2 U2 D2 B2 F2');
			expect(sequence.moves).toEqual([
				{face: 'R', amount: 2},
				{face: 'L', amount: 2},
				{face: 'U', amount: 2},
				{face: 'D', amount: 2},
				{face: 'B', amount: 2},
				{face: 'F', amount: 2},
			]);
		});
	});

	describe('#toString', () => {
		test('without cross/rouxBlock', () => {
			const sequence = MoveSequence.fromScramble('R L U D B F');
			expect(sequence.toString()).toEqual('R L U D B F');
		});

		test('with cross R', () => {
			const sequence = MoveSequence.fromScramble('R L U D B F');
			expect(sequence.toString({cross: 'R'})).toEqual('D U R L B F');
		});

		test('with cross U', () => {
			const sequence = MoveSequence.fromScramble('R L U D B F');
			// front face should be F
			expect(sequence.toString({cross: 'U'})).toEqual('L R D U B F');
		});

		test('with rouxBlock B-L-L', () => {
			const sequence = MoveSequence.fromScramble('R L U D F');
			expect(sequence.toString({
				rouxBlock: {side: 'B', bottom: 'L', bottomDirection: 'L'},
				fixDirection: true,
			})).toEqual('U D F B R');
		});

		test('with rouxBlock B-L-L and left move', () => {
			const sequence1 = MoveSequence.fromScramble('B R L U D F');
			expect(sequence1.toString({
				rouxBlock: {side: 'B', bottom: 'L', bottomDirection: 'L'},
				fixDirection: true,
			})).toEqual('r B F U D R');

			const sequence2 = MoveSequence.fromScramble("B' R L U D F");
			expect(sequence2.toString({
				rouxBlock: {side: 'B', bottom: 'L', bottomDirection: 'L'},
				fixDirection: true,
			})).toEqual("r' F B D U R");
		});

		test('with slices ["M"]', () => {
			const sequence1 = MoveSequence.fromScramble("R L' U R' L U R' L U L' R");
			expect(sequence1.toString({slices: ['M']})).toEqual("M F M' U M' B M");

			const sequence2 = MoveSequence.fromScramble("R L' R L' R L' R L' R L'");
			expect(sequence2.toString({slices: ['M']})).toEqual('M2 M2 M');

			const sequence3 = MoveSequence.fromScramble("R2 L' R L2'");
			expect(sequence3.toString({slices: ['M']})).toEqual("R M2 L'");

			const sequence4 = MoveSequence.fromScramble("R2 L2' R2' L2");
			expect(sequence4.toString({slices: ['M']})).toEqual("M2 M2'");

			const sequence5 = MoveSequence.fromScramble("L' R2 L2' R2 L2' R");
			expect(sequence5.toString({slices: ['M']})).toEqual('M2 M2 M');

			const sequence6 = MoveSequence.fromScramble("L' R2 L2' U R2 L2' R");
			expect(sequence6.toString({slices: ['M']})).toEqual("M2 L' D M2 R");
		});

		test('with slices ["M", "S"] and cross R', () => {
			// https://alg.cubing.net/?alg=U-_D_F_L_R-_D-
			// https://alg.cubing.net/?alg=z_M-_U_S_U-_x2_y
			const sequence = MoveSequence.fromScramble("U' D F L R' D'");
			const {text, orientation} = sequence.toText({slices: ['M', 'S'], cross: 'R'});
			expect(text).toEqual("M' U S U'");
			expect(getRotationNotationFromFaces({from: [orientation.left, orientation.down], to: ['L', 'D']})).toEqual('x2 y');
		});

		test('bench', () => {
			const sequence = MoveSequence.fromScramble('B R L U D F B R L U D F B R L U D F');

			console.time('MoveSequence#toString');
			for (let i = 0; i < 1000; i++) {
				sequence.toString({
					rouxBlock: {side: 'B', bottom: 'L', bottomDirection: 'L'},
					fixDirection: true,
				});
			}
			console.timeEnd('MoveSequence#toString');
		});
	});
});
