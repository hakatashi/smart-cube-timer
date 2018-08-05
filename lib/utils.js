import {Line, Vector} from 'sylvester';
import {olls, plls} from '~/lib/data.js';
import assert from 'assert';
import isEqual from 'lodash/isEqual';

const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
const faceVectors = {
	U: [0, 0, 1],
	R: [1, 0, 0],
	F: [0, -1, 0],
	D: [0, 0, -1],
	L: [-1, 0, 0],
	B: [0, 1, 0],
};
const rotationVectors = {
	x: faceVectors.R,
	y: faceVectors.U,
	z: faceVectors.F,
};
const corners = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'];
const edges = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'];

export const vectorToFace = (vector) => {
	const normalizedElements = vector.elements.map((element) => {
		assert(Math.abs(element - Math.round(element)) <= Number.EPSILON);
		return Math.round(element);
	});

	const result = Object.entries(faceVectors).find(([, faceVector]) => isEqual(faceVector, normalizedElements));
	assert(result);

	const [face] = result;
	return face;
};

export const vectorToRotation = (vector) => {
	const normalizedElements = vector.elements.map((element) => {
		assert(Math.abs(element - Math.round(element)) <= Number.EPSILON);
		return Math.round(element);
	});

	{
		const result = Object.entries(rotationVectors).find(([, rotation]) => isEqual(rotation, normalizedElements));

		if (result) {
			const [notation] = result;
			return {
				notation,
				direction: 1,
			};
		}
	}

	{
		const inversedElements = normalizedElements.map((element) => -element);
		const result = Object.entries(rotationVectors).find(([, rotation]) => isEqual(rotation, inversedElements));

		assert(result);
		const [notation] = result;
		return {
			notation,
			direction: -1,
		};
	}
};

export const getOppositeFace = (face) => ({
	U: 'D',
	D: 'U',
	R: 'L',
	L: 'R',
	F: 'B',
	B: 'F',
}[face]);

export const getRotationNotation = ({from, to}) => {
	const fromVector = Vector.create(faceVectors[from]);
	const toVector = Vector.create(faceVectors[to]);

	const directionFace = to === getOppositeFace(from) ? faces.find((f) => ![from, to].includes(f)) : to;
	const directionVector = Vector.create(faceVectors[directionFace]);

	const axisVector = fromVector.cross(directionVector);
	const angle = fromVector.angleFrom(toVector);

	if (Math.abs(angle) <= Number.EPSILON) {
		return '';
	}

	const {notation, direction} = vectorToRotation(axisVector.multiply(1 / axisVector.modulus()));

	if (Math.abs(angle - Math.PI) <= Number.EPSILON) {
		return `${notation}2`;
	}

	assert(Math.abs(angle - Math.PI / 2) <= Number.EPSILON);
	if (direction === -1) {
		return notation;
	}

	assert(direction === 1);
	return `${notation}'`;
};

export const getRelativeFace = (face, {from, to}) => {
	const faceVector = Vector.create(faceVectors[face]);
	const fromVector = Vector.create(faceVectors[from]);
	const toVector = Vector.create(faceVectors[to]);

	const directionFace = to === getOppositeFace(from) ? faces.find((f) => ![from, to].includes(f)) : to;
	const directionVector = Vector.create(faceVectors[directionFace]);

	const axisVector = fromVector.cross(directionVector);
	const axis = Line.create(Vector.Zero(3), axisVector);
	const angle = fromVector.angleFrom(toVector);

	const destinationVector = faceVector.rotate(angle, axis);

	return vectorToFace(destinationVector);
};

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

// Order really matters here
const llPiecesMap = new Map([
	[
		'U',
		{
			edges: ['DR', 'DB', 'DL', 'DF'],
			corners: ['DRB', 'DBL', 'DLF', 'DFR'],
		},
	],
	[
		'R',
		{
			edges: ['UL', 'FL', 'DL', 'BL'],
			corners: ['UFL', 'DLF', 'DBL', 'ULB'],
		},
	],
	[
		'F',
		{
			edges: ['UB', 'BL', 'DB', 'BR'],
			corners: ['ULB', 'DBL', 'DRB', 'UBR'],
		},
	],
	[
		'D',
		{
			edges: ['UB', 'UR', 'UF', 'UL'],
			corners: ['UBR', 'URF', 'UFL', 'ULB'],
		},
	],
	[
		'L',
		{
			edges: ['UR', 'BR', 'DR', 'FR'],
			corners: ['UBR', 'DRB', 'DFR', 'URF'],
		},
	],
	[
		'B',
		{
			edges: ['UF', 'FR', 'DF', 'FL'],
			corners: ['URF', 'DFR', 'DLF', 'UFL'],
		},
	],
].map(([face, {edges: edgePieces, corners: cornerPieces}]) => [
	face,
	{
		edges: edgePieces.map((edge) => [edges.findIndex((e) => e === edge), edge]),
		corners: cornerPieces.map((corner) => [corners.findIndex((c) => c === corner), corner]),
	},
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

export const getOll = ({eo, co}) => {
	const coClone = co.slice();
	const eoClone = eo.slice();

	for (const direction of Array(4).keys()) {
		for (const [name, oll] of olls) {
			if (isEqual(oll, [...coClone, ...eoClone])) {
				return {
					name,
					direction,
					isEdgeOriented: eoClone.every((orientation) => orientation === 0),
				};
			}
		}

		coClone.unshift(coClone.pop()); // rotate right
		eoClone.unshift(eoClone.pop()); // rotate right
	}

	return assert(false);
};

export const getPll = ({ep, cp}) => {
	const cpClone = cp.slice();
	const epClone = ep.slice();

	for (const direction of Array(4).keys()) {
		for (const shift of Array(4).keys()) {
			for (const [name, pll] of plls) {
				if (isEqual(pll, [
					...cpClone.map((perm) => (perm + shift) % 4),
					...epClone.map((perm) => (perm + shift) % 4),
				])) {
					return {name, direction, shift};
				}
			}
		}

		cpClone.unshift(cpClone.pop()); // rotate right
		epClone.unshift(epClone.pop()); // rotate right
	}

	return assert(false);
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
	const oppositeFace = getOppositeFace(cross);
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

	if (stage.startsWith('f2l') && stage !== 'f2l4') {
		if (
			(stage === 'f2l1' && solvedPairs.length >= 1) ||
			(stage === 'f2l2' && solvedPairs.length >= 2) ||
			(stage === 'f2l3' && solvedPairs.length >= 3)
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

	if (solvedPairs.length !== 4) {
		return {
			result: false,
			solvedPairs,
		};
	}

	const {edges: llEdges, corners: llCorners} = llPiecesMap.get(cross);

	// POOOOOOOOOOOOOOOOO
	// I can't read this even immediately after writing this💩
	const llCornerOrientations = llCorners.map(([cornerIndex, cornerPiece]) => (
		(
			3 +
			[...corners[cube.cp[cornerIndex]]].findIndex((face) => face === oppositeFace) -
			[...cornerPiece].findIndex((face) => face === oppositeFace) +
			cube.co[cornerIndex]
		) % 3
	));
	const llEdgeOrientations = llEdges.map(([edgeIndex, edgePiece]) => (
		(
			2 +
			[...edges[cube.ep[edgeIndex]]].findIndex((face) => face === oppositeFace) -
			[...edgePiece].findIndex((face) => face === oppositeFace) +
			cube.eo[edgeIndex]
		) % 2
	));

	const oll = getOll({eo: llEdgeOrientations, co: llCornerOrientations});

	if (stage === 'f2l4') {
		return {
			result: true,
			oll,
			solvedPairs,
		};
	}

	const isOriented = [...llCornerOrientations, ...llEdgeOrientations].every((orientation) => orientation === 0);

	if (!isOriented) {
		return {
			result: false,
			oll,
			solvedPairs,
		};
	}

	const llCornerPermutations = llCorners.map(([cornerIndex]) => (
		llCorners.findIndex(([targetCornerIndex]) => targetCornerIndex === cube.cp[cornerIndex])
	));
	const llEdgePermutations = llEdges.map(([edgeIndex]) => (
		llEdges.findIndex(([targetEdgeIndex]) => targetEdgeIndex === cube.ep[edgeIndex])
	));

	const pll = getPll({ep: llEdgePermutations, cp: llCornerPermutations});

	if (stage === 'oll') {
		return {
			result: true,
			oll,
			pll,
			solvedPairs,
		};
	}

	if (stage === 'pll') {
		return {
			result: pll.name === 'PLL Skip',
			oll,
			pll,
			solvedPairs,
		};
	}

	assert(stage === 'auf');
	return {
		result: cube.isSolved(),
		oll,
		pll,
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
