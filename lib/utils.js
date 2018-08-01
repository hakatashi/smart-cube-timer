import isEqual from 'lodash/isEqual';
import assert from 'assert';

const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
const corners = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'];
const edges = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'];

const crossEdgesMap = new Map(faces.map((face) => [
	face,
	[...edges.entries()].filter(([, edge]) => edge.includes(face)),
]));

const f2lPairsMap = new Map(faces.map((face) => [
	face,
	[...corners.entries()].filter(([, corner]) => (
		corner.includes(face)
	)).map(([cornerIndex, corner]) => ({
		corner,
		cornerIndex,
		edge: edges.find((edge) => isEqual([...edge, face].sort(), [...corner].sort())),
		edgeIndex: edges.findIndex((edge) => isEqual([...edge, face].sort(), [...corner].sort())),
	})),
]));

export const getNextStage = (stage) => {
	if (stage === 'f2l1') {
		return 'f2l2';
	}

	if (stage === 'f2l2') {
		return 'f2l3';
	}

	if (stage === 'f2l3') {
		return 'f2l4';
	}

	if (stage === 'f2l4') {
		return 'oll';
	}

	if (stage === 'oll') {
		return 'pll';
	}

	if (stage === 'pll') {
		return 'auf';
	}

	assert(stage === 'auf');
	return 'solved';
};

export const findCross = (cube) => {
	for (const face of faces) {
		const crossEdges = crossEdgesMap.get(face);
		const isCrossed = crossEdges.every(([edgeIndex]) => (
			cube.eo[edgeIndex] === 0 && cube.ep[edgeIndex] === edgeIndex
		));
		if (isCrossed) {
			return face;
		}
	}
	return null;
};

export const formatTime = (time) => {
	const minute = Math.floor(time / 60 / 1000).toString();
	const second = (Math.floor(time / 1000) % 60).toString().padStart(minute === '0' ? 1 : 2, '0');
	const msecond = (Math.floor(time / 10) % 100).toString().padStart(2, '0');

	if (minute === '0') {
		return `${second}.${msecond}`;
	}

	return `${minute}:${second}.${msecond}`;
};

export const isStageSatisfied = ({cube, stage, cross}) => {
	const crossEdges = crossEdgesMap.get(cross);
	const isCrossed = crossEdges.every(([edgeIndex]) => (
		cube.eo[edgeIndex] === 0 && cube.ep[edgeIndex] === edgeIndex
	));

	if (!isCrossed) {
		return {
			result: false,
		};
	}

	const f2lPairs = f2lPairsMap.get(cross);
	const solvedPairs = [];
	for (const {cornerIndex, edge, edgeIndex} of f2lPairs) {
		if (
			cube.co[cornerIndex] === 0 &&
			cube.cp[cornerIndex] === cornerIndex &&
			cube.eo[edgeIndex] === 0 &&
			cube.ep[edgeIndex] === edgeIndex
		) {
			solvedPairs.push(edge);
		}
	}

	if (stage.startsWith('f2l')) {
		if (
			(stage === 'f2l1' && solvedPairs.length >= 1) ||
			(stage === 'f2l2' && solvedPairs.length >= 2) ||
			(stage === 'f2l3' && solvedPairs.length >= 3) ||
			(stage === 'f2l4' && solvedPairs.length >= 4)
		) {
			return {
				result: true,
				solvedPairs,
			};
		}

		return {
			result: false,
			solvedPairs,
		};
	}

	return {
		result: false,
		solvedPairs,
	};
};

// https://gist.github.com/aozisik/9718be69fcb3b05e2221
export const idealTextColor = (background) => {
	const r = background.substring(1, 3);
	const g = background.substring(3, 5);
	const b = background.substring(5, 7);

	const components = {R: parseInt(r, 16), G: parseInt(g, 16), B: parseInt(b, 16)};
	const nThreshold = 105;

	const bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
	return ((255 - bgDelta) < nThreshold) ? '#333333' : '#ffffff';
};
