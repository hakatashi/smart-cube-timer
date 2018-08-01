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
	assert(faces.includes(move.face), 'A');

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
		this.moves = moves;
	}

	toString() {
		return this.moves.map((move) => moveToString(move)).join(' ');
	}

	unshift(move) {
		assert(faces.includes(move.face));

		const newMove = {
			face: move.face,
			amount: ((move.amount || 0) % 4 + 4) % 4,
		};

		if (this.length === 0) {
			this.moves.unshift(newMove);
			return;
		}

		const firstMove = this.moves[0];

		if (firstMove.face !== newMove.face) {
			this.moves.unshift(newMove);
			return;
		}

		const newAmount = (firstMove.amount + newMove.amount) % 4;
		if (newAmount === 0) {
			this.moves.shift();
		} else {
			this.moves[0].amount = newAmount;
		}
	}

	get length() {
		return this.moves.length;
	}
}

MoveSequence.fromScramble = (scramble) => {
	const moves = scramble.split(' ').map((moveString) => {
		assert(moveStrings.has(moveString), 'C');
		return {...moveStrings.get(moveString)};
	});
	return new MoveSequence(moves);
};

MoveSequence.moveToString = moveToString;

export default MoveSequence;
