/* eslint-env jest */

import MoveSequence from './MoveSequence.js';

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
			const sequence = MoveSequence.fromScramble('R\' L\' U\' D\' B\' F\'');
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

			const sequence2 = MoveSequence.fromScramble('B\' R L U D F');
			expect(sequence2.toString({
				rouxBlock: {side: 'B', bottom: 'L', bottomDirection: 'L'},
				fixDirection: true,
			})).toEqual('r\' F B D U R');
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
