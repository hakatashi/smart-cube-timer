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
		test('without cross', () => {
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
	});
});
