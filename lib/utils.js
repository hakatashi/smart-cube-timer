/* eslint no-use-before-define: off, array-plural/array-plural: off */

import {Line, Vector} from 'sylvester';
import {clls, lseos, olls, plls} from '~/lib/data.js';
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
			const [face] = result;
			return {
				face,
				direction: 1,
			};
		}
	}

	{
		const inversedElements = normalizedElements.map((element) => -element);
		const result = Object.entries(rotationVectors).find(([, rotation]) => isEqual(rotation, inversedElements));

		assert(result);
		const [face] = result;
		return {
			face,
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

export const getRotation = ({from, to}) => {
	if (from === to) {
		return {face: '', amount: 0};
	}

	const fromVector = Vector.create(faceVectors[from]);
	const toVector = Vector.create(faceVectors[to]);

	const directionFace = to === getOppositeFace(from) ? faces.find((f) => ![from, to].includes(f)) : to;
	const directionVector = Vector.create(faceVectors[directionFace]);

	const axisVector = fromVector.cross(directionVector);
	const angle = fromVector.angleFrom(toVector);

	const {face, direction} = vectorToRotation(axisVector.multiply(1 / axisVector.modulus()));

	if (Math.abs(angle - Math.PI) <= Number.EPSILON) {
		return {face, amount: 2};
	}

	assert(Math.abs(angle - Math.PI / 2) <= Number.EPSILON);
	if (direction === -1) {
		return {face, amount: 1};
	}

	assert(direction === 1);
	return {face, amount: -1};
};

export const getRotationNotation = ({from, to}) => {
	const {face, amount} = getRotation({from, to});

	if (amount === 0) {
		return '';
	}

	if (amount === 2) {
		return `${face}2`;
	}

	if (amount === 1) {
		return face;
	}

	assert(amount === -1);
	return `${face}'`;
};

export const getRelativeFace = (face, {from, to}) => {
	if (from === to) {
		return face;
	}

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
const facePiecesMap = new Map([
	[
		'D',
		{
			edges: ['DR', 'DB', 'DL', 'DF'],
			corners: ['DRB', 'DBL', 'DLF', 'DFR'],
		},
	],
	[
		'L',
		{
			edges: ['UL', 'FL', 'DL', 'BL'],
			corners: ['UFL', 'DLF', 'DBL', 'ULB'],
		},
	],
	[
		'B',
		{
			edges: ['UB', 'BL', 'DB', 'BR'],
			corners: ['ULB', 'DBL', 'DRB', 'UBR'],
		},
	],
	[
		'U',
		{
			edges: ['UB', 'UR', 'UF', 'UL'],
			corners: ['UBR', 'URF', 'UFL', 'ULB'],
		},
	],
	[
		'R',
		{
			edges: ['UR', 'BR', 'DR', 'FR'],
			corners: ['UBR', 'DRB', 'DFR', 'URF'],
		},
	],
	[
		'F',
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

	if (stage === 'auf') {
		return 'solved';
	}

	if (stage === 'block2') {
		return 'cll';
	}

	if (stage === 'cll') {
		return 'lseo';
	}

	if (stage === 'lseo') {
		return 'lsep';
	}

	assert(stage === 'lsep');
	return 'solved';
};

export const findRouxBlock = (cube) => {
	for (const side of faces) {
		const {co, eo} = getFaceOrientations(side, cube);
		const {cp, ep} = getFacePermutations(side, cube);

		// Check if 2x2 block is satisfied for each corners
		const is2x2BlockSatisfied = Array(4).fill().map((_, cornerIndex) => (
			co[cornerIndex] === 0 &&
			eo[cornerIndex] === 0 &&
			eo[(cornerIndex + 1) % 4] === 0 &&
			cp[cornerIndex] === ep[cornerIndex] &&
			(cp[cornerIndex] + 1) % 4 === ep[(cornerIndex + 1) % 4]
		));

		// If sequential 2x2 block is satisfied it's 2x3 block
		const satisfied2x3Block = Array(4).fill().findIndex((item, i) => (
			is2x2BlockSatisfied[i] && is2x2BlockSatisfied[(i + 1) % 4]
		));

		if (satisfied2x3Block !== -1) {
			const facePieces = facePiecesMap.get(side);
			const [, centralEdgePiece] = facePieces.edges[ep[(satisfied2x3Block + 1) % 4]];
			const bottom = [...centralEdgePiece].find((face) => face !== side);
			return {side, bottom};
		}
	}

	return null;
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
		for (const [index, [name, oll]] of olls.entries()) {
			if (isEqual(oll, [...coClone, ...eoClone])) {
				return {
					index,
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
			for (const [index, [name, pll]] of plls.entries()) {
				if (isEqual(pll, [
					...cpClone.map((perm) => (perm + shift) % 4),
					...epClone.map((perm) => (perm + shift) % 4),
				])) {
					return {index, name, direction, shift};
				}
			}
		}

		cpClone.unshift(cpClone.pop()); // rotate right
		epClone.unshift(epClone.pop()); // rotate right
	}

	return assert(false);
};

export const getCll = ({cp, co}) => {
	const cpClone = cp.slice();
	const coClone = co.slice();

	for (const direction of Array(4).keys()) {
		for (const shift of Array(4).keys()) {
			for (const [index, [name, cll]] of clls.entries()) {
				if (isEqual(cll, [
					...cpClone.map((perm) => (perm + shift) % 4),
					...coClone,
				])) {
					return {index, name, direction, shift};
				}
			}
		}

		cpClone.unshift(cpClone.pop()); // rotate right
		coClone.unshift(coClone.pop()); // rotate right
	}

	return assert(false);
};

export const getLseo = ({topEo, bottomEo}) => {
	const topEoClone = topEo.slice();
	const bottomMisorientations = bottomEo.filter((orientation) => orientation !== 0).length;

	for (const direction of Array(4).keys()) {
		for (const [index, [name, lseo]] of lseos.entries()) {
			if (isEqual(lseo, [bottomMisorientations, ...topEoClone])) {
				return {
					index,
					name,
					direction,
				};
			}
		}

		topEoClone.unshift(topEoClone.pop()); // rotate right
	}

	return assert(false);
};

export const formatTime = (time) => {
	if (Number.isNaN(time) || !Number.isFinite(time) || time === null) {
		return '-';
	}

	if (time <= 0) {
		return '0.00';
	}

	const minute = Math.floor(time / 60 / 1000).toString();
	const second = (Math.floor(time / 1000) % 60).toString().padStart(minute === '0' ? 1 : 2, '0');
	const msecond = (Math.floor(time / 10) % 100).toString().padStart(2, '0');

	if (minute === '0') {
		return `${second}.${msecond}`;
	}

	return `${minute}:${second}.${msecond}`;
};

export const formatDate = (time) => {
	const date = new Date(time);

	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hour = date.getHours().toString().padStart(2, '0');
	const minute = date.getMinutes().toString().padStart(2, '0');

	return `${month}-${day} ${hour}:${minute}`;
};

const getFaceOrientations = (face, cube, targetFace) => {
	const {edges: targetFaceEdges, corners: targetFaceCorners} = facePiecesMap.get(targetFace || face);

	// POOOOOOOOOOOOOOOOO
	// I can't read this even immediately after writing this💩
	const co = targetFaceCorners.map(([cornerIndex, cornerPiece]) => {
		const targetFaceOrientation = [...corners[cube.cp[cornerIndex]]].findIndex((f) => f === face);
		if (targetFaceOrientation === -1) {
			return -1;
		}

		return (
			3 +
			targetFaceOrientation -
			[...cornerPiece].findIndex((f) => f === (targetFace || face)) +
			cube.co[cornerIndex]
		) % 3;
	});

	const eo = targetFaceEdges.map(([edgeIndex, edgePiece]) => {
		const targetFaceOrientation = [...edges[cube.ep[edgeIndex]]].findIndex((f) => f === face);
		if (targetFaceOrientation === -1) {
			return -1;
		}

		return (
			2 +
			targetFaceOrientation -
			[...edgePiece].findIndex((f) => f === (targetFace || face)) +
			cube.eo[edgeIndex]
		) % 2;
	});

	return {eo, co};
};

const getFacePermutations = (face, cube, targetFace) => {
	const {edges: targetFaceEdges, corners: targetFaceCorners} = facePiecesMap.get(targetFace || face);
	const {edges: faceEdges, corners: faceCorners} = facePiecesMap.get(face);

	const cp = targetFaceCorners.map(([targetCornerIndex]) => (
		faceCorners.findIndex(([cornerIndex]) => cornerIndex === cube.cp[targetCornerIndex])
	));

	const ep = targetFaceEdges.map(([targetEdgeIndex]) => (
		faceEdges.findIndex(([edgeIndex]) => edgeIndex === cube.ep[targetEdgeIndex])
	));

	return {cp, ep};
};

export const isCfopStageSatisfied = ({cube, stage, cross}) => {
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

	const {co: llCornerOrientations, eo: llEdgeOrientations} = getFaceOrientations(oppositeFace, cube);

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

	const {cp: llCornerPermutations, ep: llEdgePermutations} = getFacePermutations(oppositeFace, cube);

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

// face, bottom: color of primary face and bottom color of target block
// bottomDirection: expected direction that bottom of block directs
export const isRouxBlockSatisfied = ({cube, face, bottom, bottomDirection}) => {
	if (face === bottomDirection || getOppositeFace(face) === bottomDirection) {
		return false;
	}

	const {co, eo} = getFaceOrientations(face, cube);
	const {cp, ep} = getFacePermutations(face, cube);

	const facePieces = facePiecesMap.get(face);
	const bottomPieceIndex = facePieces.edges.findIndex(([, edge]) => edge.includes(bottom));
	const bottomDirectionIndex = facePieces.edges.findIndex(([, edge]) => edge.includes(bottomDirection));

	return (
		eo[(bottomDirectionIndex + 3) % 4] === 0 &&
		eo[(bottomDirectionIndex + 0) % 4] === 0 &&
		eo[(bottomDirectionIndex + 1) % 4] === 0 &&
		ep[(bottomDirectionIndex + 3) % 4] === (bottomPieceIndex + 3) % 4 &&
		ep[(bottomDirectionIndex + 0) % 4] === (bottomPieceIndex + 0) % 4 &&
		ep[(bottomDirectionIndex + 1) % 4] === (bottomPieceIndex + 1) % 4 &&
		co[(bottomDirectionIndex + 3) % 4] === 0 &&
		co[(bottomDirectionIndex + 0) % 4] === 0 &&
		cp[(bottomDirectionIndex + 3) % 4] === (bottomPieceIndex + 3) % 4 &&
		cp[(bottomDirectionIndex + 0) % 4] === (bottomPieceIndex + 0) % 4
	);
};

export const isRouxStageSatisfied = ({cube, stage, rouxBlock: {side, bottom}}) => {
	const antiSide = getOppositeFace(side);
	const top = getOppositeFace(bottom);

	const bottomDirection = faces.find((face) => (
		isRouxBlockSatisfied({cube, face: side, bottom, bottomDirection: face})
	));

	if (bottomDirection === undefined) {
		return {
			result: false,
		};
	}

	const block2Satisfied = isRouxBlockSatisfied({cube, face: antiSide, bottom, bottomDirection});

	if (!block2Satisfied) {
		return {
			result: false,
			bottomDirection,
		};
	}

	const topDirection = getOppositeFace(bottomDirection);
	const {co, eo: topEoByTop} = getFaceOrientations(top, cube, topDirection);
	const {cp} = getFacePermutations(top, cube, topDirection);

	const cll = getCll({co, cp});

	if (stage === 'block2') {
		return {
			result: true,
			bottomDirection,
			cll,
		};
	}

	if (cll.name !== 'CLL Skip') {
		return {
			result: false,
			bottomDirection,
			cll,
		};
	}

	const {eo: topEoByBottom} = getFaceOrientations(bottom, cube, topDirection)
	const {eo: bottomEoByTop} = getFaceOrientations(top, cube, bottomDirection)
	const {eo: bottomEoByBottom} = getFaceOrientations(bottom, cube, bottomDirection)

	const topEo = topEoByTop.map((orientation, index) => orientation === -1 ? topEoByBottom[index] : orientation);
	const bottomEo = bottomEoByTop.map((orientation, index) => orientation === -1 ? bottomEoByBottom[index] : orientation);

	// LSEO case detection is not working well because orientation of center is not considered
	const lseo = getLseo({topEo, bottomEo});

	if (stage === 'cll') {
		return {
			result: true,
			bottomDirection,
			cll,
			lseo,
		};
	}

	const isLseoSatisfied = lseo.name === 'EO Skip' && (bottomDirection === bottom || topDirection === bottom);

	if (stage === 'lseo') {
		return {
			result: isLseoSatisfied,
			bottomDirection,
			cll,
			lseo,
		};
	}

	assert(stage === 'lsep');

	return {
		result: cube.isSolved(),
		bottomDirection,
		cll,
		lseo,
	};
};

export const isStageSatisfied = ({mode, cube, stage, cross, rouxBlock}) => {
	if (mode === 'cfop') {
		return isCfopStageSatisfied({cube, stage, cross});
	}

	assert(mode === 'roux');
	return isRouxStageSatisfied({cube, stage, rouxBlock});
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

// 😇
export const mod = (n, modulo) => ((n % modulo) + modulo) % modulo;

export const getInspectionTime = ({stage, cross, previousTime}) => {
	const firstNonTrivialMove = stage.sequence && stage.sequence.getFirstNonTrivialMove({cross});
	const inspection = firstNonTrivialMove === null ? null : firstNonTrivialMove.time - previousTime;
	const execution = inspection === null ? null : stage.time - firstNonTrivialMove.time;

	return {inspection, execution};
};
