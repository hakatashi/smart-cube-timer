/* eslint-env jest */

import MoveSequence from '~/lib/MoveSequence.js';
import SolveAnalyzer from './SolveAnalyzer.js';

// http://cubesolv.es/solve/5020
const scramble = MoveSequence.fromScramble('B2 U L2 U R2 D2 B2 L2 R2 F\' U\' L2 R F\' U L\' B D F2 L', {mode: 'reduction'});
const solve = [
	{face: 'F', amount: 1, time: 0},
	{face: 'D', amount: 1, time: 594},
	{face: 'L', amount: -1, time: 1450},
	{face: 'B', amount: -1, time: 2244},
	{face: 'U', amount: 1, time: 3046},
	{face: 'R', amount: -1, time: 4296},
	{face: 'D', amount: 1, time: 7055},
	{face: 'R', amount: 1, time: 7747},
	{face: 'L', amount: -1, time: 9145},
	{face: 'D', amount: 1, time: 9599},
	{face: 'L', amount: 1, time: 10146},
	{face: 'D', amount: 1, time: 10756},
	{face: 'R', amount: 1, time: 11253},
	{face: 'D', amount: -1, time: 11897},
	{face: 'R', amount: -1, time: 12599},
	{face: 'D', amount: -1, time: 13494},
	{face: 'R', amount: 1, time: 13994},
	{face: 'D', amount: 1, time: 14648},
	{face: 'R', amount: -1, time: 15444},
	{face: 'D', amount: 1, time: 16760},
	{face: 'D', amount: 1, time: 18144},
	{face: 'B', amount: 1, time: 18750},
	{face: 'D', amount: -1, time: 19399},
	{face: 'B', amount: -1, time: 20200},
	{face: 'D', amount: -1, time: 20859},
	{face: 'F', amount: -1, time: 21711},
	{face: 'D', amount: -1, time: 22145},
	{face: 'F', amount: 1, time: 22944},
	{face: 'D', amount: -1, time: 24447},
	{face: 'B', amount: 1, time: 24848},
	{face: 'D', amount: -1, time: 25510},
	{face: 'B', amount: -1, time: 26196},
	{face: 'D', amount: 1, time: 26860},
	{face: 'B', amount: 1, time: 27600},
	{face: 'D', amount: -1, time: 28152},
	{face: 'B', amount: -1, time: 29104},
	{face: 'D', amount: 1, time: 30378},
	{face: 'B', amount: -1, time: 30994},
	{face: 'D', amount: -1, time: 31545},
	{face: 'L', amount: -1, time: 32701},
	{face: 'D', amount: 1, time: 33260},
	{face: 'L', amount: 1, time: 33796},
	{face: 'B', amount: 1, time: 34550},
	{face: 'D', amount: -1, time: 35908},
	{face: 'D', amount: -1, time: 36500},
];

describe('SolveAnalyzer', () => {
	let analyzer = null;

	beforeEach(() => {
		analyzer = new SolveAnalyzer({scramble: scramble.moves});
	});

	test('mode is cfop', () => {
		analyzer.pushMoves(solve);
		expect(analyzer.state.cubeStage).toEqual('solved');
		expect(analyzer.state.mode).toEqual('cfop');
		expect(analyzer.state.cross).toEqual('U');
		expect(analyzer.state.isOll2Look).toEqual(false);
		expect(analyzer.state.oll.name).toEqual('OLL 43');
		expect(analyzer.state.pllLooks.length).toEqual(0);
		expect(analyzer.state.pll.name).toEqual('PLL Skip');
	});
});
