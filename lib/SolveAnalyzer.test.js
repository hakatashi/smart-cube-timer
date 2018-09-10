/* eslint-env jest */

import MoveSequence from '~/lib/MoveSequence.js';
import SolveAnalyzer from './SolveAnalyzer.js';

describe('SolveAnalyzer', () => {
	let analyzer = null;

	describe('CFOP solve', () => {
		/* eslint-disable quotes */
		// http://cubesolv.es/solve/5020
		const scramble = MoveSequence.fromScramble("B2 U L2 U R2 D2 B2 L2 R2 F' U' L2 R F' U L' B D F2 L").moves;
		const solve = {
			cross: MoveSequence.fromScramble("F D L' B' U").moves,
			f2l1: MoveSequence.fromScramble("R' D R").moves,
			f2l2: MoveSequence.fromScramble("L' D L D R D' R' D' R D R'").moves,
			f2l3: MoveSequence.fromScramble("D D B D' B' D' F' D' F").moves,
			f2l4: MoveSequence.fromScramble("D' B D' B' D B D' B'").moves,
			oll: MoveSequence.fromScramble("D B' D' L' D L B").moves,
			auf: MoveSequence.fromScramble("D' D'").moves,
		};
		/* eslint-enable quotes */

		beforeEach(() => {
			analyzer = new SolveAnalyzer({scramble});
		});

		test('follow solves', () => {
			expect(analyzer.state.cubeStage).toEqual('unknown');
			expect(analyzer.state.mode).toEqual(null);
			expect(analyzer.state.cross).toEqual(null);
			expect(analyzer.state.oll).toEqual(null);
			expect(analyzer.state.pllLooks.length).toEqual(0);
			expect(analyzer.state.pll).toEqual(null);

			analyzer.pushMoves(solve.cross);

			expect(analyzer.state.cubeStage).toEqual('f2l1');
			expect(analyzer.state.mode).toEqual('cfop');
			expect(analyzer.state.cross).toEqual('U');

			analyzer.pushMoves(solve.f2l1);

			expect(analyzer.state.cubeStage).toEqual('f2l2');

			analyzer.pushMoves(solve.f2l2);

			expect(analyzer.state.cubeStage).toEqual('f2l3');

			analyzer.pushMoves(solve.f2l3);

			expect(analyzer.state.cubeStage).toEqual('f2l4');

			analyzer.pushMoves(solve.f2l4);

			expect(analyzer.state.cubeStage).toEqual('oll');
			expect(analyzer.state.oll.name).toEqual('OLL 43');

			analyzer.pushMoves(solve.oll);

			expect(analyzer.state.cubeStage).toEqual('auf');
			expect(analyzer.state.isOll2Look).toEqual(false);
			expect(analyzer.state.pll.name).toEqual('PLL Skip');
			expect(analyzer.state.pllLooks.length).toEqual(0);

			analyzer.pushMoves(solve.auf);

			expect(analyzer.state.cubeStage).toEqual('solved');
		});
	});
});
