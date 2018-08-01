import assert from 'assert';

const faces = ['F', 'B', 'R', 'L', 'U', 'D'];
const moveStrings = new Map([
	...faces.map((face) => [
		face,
		{
			face,
			amount: 1,
		},
	]),
	...faces.map((face) => [
		`${face}'`,
		{
			face,
			amount: 3,
		},
	]),
	...faces.map((face) => [
		`${face}2`,
		{
			face,
			amount: 2,
		},
	]),
]);

const moveToString = (move) => {
	assert(faces.includes(move.face));

	if (move.amount === 1) {
		return move.face;
	}

	if (move.amount === 2) {
		return `${move.face}2`;
	}

	assert(move.amount === 3);
	return `${move.face}'`;
};

class MoveSequence {
	constructor(moves) {
		console.log(moves);
		this.moves = moves;
	}

	toString() {
		return this.moves.map((move) => moveToString(move)).join(' ');
	}
}

MoveSequence.fromScramble = (scramble) => {
	const moves = scramble.split(' ').map((moveString) => {
		assert(moveStrings.has(moveString));
		return moveStrings.get(moveString);
	});
	return new MoveSequence(moves);
};

export default MoveSequence;
