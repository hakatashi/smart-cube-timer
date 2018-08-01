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

export const parser = (cube) => {
	cube;
};
