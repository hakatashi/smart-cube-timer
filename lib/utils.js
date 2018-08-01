const faces = ['U', 'R', 'F', 'D', 'L', 'B'];
const corners = ['URF', 'UFL', 'ULB', 'UBR', 'DFR', 'DLF', 'DBL', 'DRB'];
const edges = ['UR', 'UF', 'UL', 'UB', 'DR', 'DF', 'DL', 'DB', 'FR', 'FL', 'BL', 'BR'];

const crossEdgesMap = new Map(faces.map((face) => [
	face,
	[...edges.entries()].filter(([, edge]) => edge.includes(face)),
]))

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

export const parser = (cube) => {
	cube;
};
