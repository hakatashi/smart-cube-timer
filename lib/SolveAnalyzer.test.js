/* eslint-env jest */

import MoveSequence from '~/lib/MoveSequence.js';
import SolveAnalyzer from './SolveAnalyzer.js';

describe('SolveAnalyzer', () => {
	let analyzer = null;

	// http://www.cubesolv.es/solve/5297
	describe('CFOP solve', () => {
		/* eslint-disable quotes */
		const scramble = MoveSequence.fromScramble("R2 U B2 L2 D U2 F U' F L2 B' F D' B' L2 U2 L R F2").moves;
		const solve = {
			cross: MoveSequence.fromScramble("L' F' D F' B").moves,
			f2l1: MoveSequence.fromScramble("U F' U' F B' U B").moves,
			f2l2: MoveSequence.fromScramble("U F U' F' U' F U F'").moves,
			f2l3: MoveSequence.fromScramble("R' U R U' R U R'").moves,
			f2l4: MoveSequence.fromScramble("U' U' B U B'").moves,
			oll: MoveSequence.fromScramble("U' R U B U' B' U B U' B' R'").moves,
			pll: MoveSequence.fromScramble("U B U B' U B' U' B B U' B' U B' U B").moves,
			auf: MoveSequence.fromScramble("U'").moves,
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
			expect(analyzer.state.cross).toEqual('D');

			analyzer.pushMoves(solve.f2l1);

			expect(analyzer.state.cubeStage).toEqual('f2l2');

			analyzer.pushMoves(solve.f2l2);

			expect(analyzer.state.cubeStage).toEqual('f2l3');

			analyzer.pushMoves(solve.f2l3);

			expect(analyzer.state.cubeStage).toEqual('f2l4');

			analyzer.pushMoves(solve.f2l4);

			expect(analyzer.state.cubeStage).toEqual('oll');
			expect(analyzer.state.oll.name).toEqual('OLL 51');

			analyzer.pushMoves(solve.oll);

			expect(analyzer.state.cubeStage).toEqual('pll');
			expect(analyzer.state.isOll2Look).toEqual(false);
			expect(analyzer.state.pll.name).toEqual('Ua Perm');

			analyzer.pushMoves(solve.pll);

			expect(analyzer.state.cubeStage).toEqual('auf');
			expect(analyzer.state.pllLooks.length).toEqual(1);

			analyzer.pushMoves(solve.auf);

			expect(analyzer.state.cubeStage).toEqual('solved');
		});
	});

	// http://cubesolv.es/solve/5020
	describe('CFOP solve with PLL skip', () => {
		/* eslint-disable quotes */
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

	// http://www.cubesolv.es/solve/5295
	describe('CFOP solve with Xcross', () => {
		/* eslint-disable quotes */
		const scramble = MoveSequence.fromScramble("U2 R2 B' F R2 D2 F2 U' L F2 D' L B2 R U' B D U' B").moves;
		const solve = {
			xcross: MoveSequence.fromScramble("F' L' L' D' R' D' R'").moves,
			f2l2: MoveSequence.fromScramble("U' R U' R' U R' U' R").moves,
			f2l3: MoveSequence.fromScramble("U' U R U R'").moves,
			f2l4: MoveSequence.fromScramble("B' U B U' B' U B").moves,
			oll: MoveSequence.fromScramble("U' U F' U' F' L F L' U F").moves,
			pll: MoveSequence.fromScramble("U' L' U' L F F D R' U R U' R D' F' F'").moves,
			auf: MoveSequence.fromScramble("U' U'").moves,
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

			analyzer.pushMoves(solve.xcross);

			expect(analyzer.state.cubeStage).toEqual('f2l2');
			expect(analyzer.state.mode).toEqual('cfop');
			expect(analyzer.state.cross).toEqual('D');

			analyzer.pushMoves(solve.f2l2);

			expect(analyzer.state.cubeStage).toEqual('f2l3');

			analyzer.pushMoves(solve.f2l3);

			expect(analyzer.state.cubeStage).toEqual('f2l4');

			analyzer.pushMoves(solve.f2l4);

			expect(analyzer.state.cubeStage).toEqual('oll');
			expect(analyzer.state.oll.name).toEqual('OLL 46');

			analyzer.pushMoves(solve.oll);

			expect(analyzer.state.cubeStage).toEqual('pll');
			expect(analyzer.state.isOll2Look).toEqual(false);
			expect(analyzer.state.pll.name).toEqual('Gb Perm');

			analyzer.pushMoves(solve.pll);

			expect(analyzer.state.cubeStage).toEqual('auf');
			expect(analyzer.state.pllLooks.length).toEqual(1);

			analyzer.pushMoves(solve.auf);

			expect(analyzer.state.cubeStage).toEqual('solved');
		});
	});

	// http://www.cubesolv.es/solve/1519
	describe('Roux solve', () => {
		/* eslint-disable quotes */
		const scramble = MoveSequence.fromScramble("B L2 B D2 B2 U L2 D2 R U L R2 D R D U2 L' U2").moves;
		const solve = {
			block1: MoveSequence.fromScramble("F' L' B' F' D' U D' U B'").moves,
			block2: MoveSequence.fromScramble("D' U D' U L' D D L L U' F' D' U L D' L L D").moves,
			cll: MoveSequence.fromScramble("D' L' D L' D' L L D").moves,
			lseo: MoveSequence.fromScramble("L' D U' F D' U L L D U' F' D' U").moves,
			lsep: MoveSequence.fromScramble("L D U' F F D' U L' D' U B B D U' L L").moves,
		};
		/* eslint-enable quotes */

		beforeEach(() => {
			analyzer = new SolveAnalyzer({scramble});
		});

		test('follow solves', () => {
			expect(analyzer.state.cubeStage).toEqual('unknown');
			expect(analyzer.state.mode).toEqual(null);
			expect(analyzer.state.rouxBlock).toEqual(null);
			expect(analyzer.state.cll).toEqual(null);

			analyzer.pushMoves(solve.block1);

			expect(analyzer.state.cubeStage).toEqual('block2');
			expect(analyzer.state.mode).toEqual('roux');
			expect(analyzer.state.rouxBlock.side).toEqual('U');
			expect(analyzer.state.rouxBlock.bottom).toEqual('R');

			analyzer.pushMoves(solve.block2);

			expect(analyzer.state.cubeStage).toEqual('cll');
			expect(analyzer.state.cll.name).toEqual('AS1');

			analyzer.pushMoves(solve.cll);

			expect(analyzer.state.cubeStage).toEqual('lseo');

			analyzer.pushMoves(solve.lseo);

			expect(analyzer.state.cubeStage).toEqual('lsep');

			analyzer.pushMoves(solve.lsep);

			expect(analyzer.state.cubeStage).toEqual('solved');
		});
	});
});
