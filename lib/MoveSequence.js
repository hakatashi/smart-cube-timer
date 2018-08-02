import assert from 'assert';
import last from 'lodash/last';

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
			amount: -1,
		},
	]),
	...faces.map((face) => [
		`${face}2`,
		{
			face,
			amount: 2,
		},
	]),
	...faces.map((face) => [
		`${face}2'`,
		{
			face,
			amount: -2,
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

	if (move.amount === -1) {
		return `${move.face}'`;
	}

	assert(move.amount === -2);
	return `${move.face}2'`;
};

const normalizeAmount = (amount) => (
	((amount + 1) % 4 + 4) % 4 - 1
);

class MoveSequence {
	constructor(moves = [], {mode = 'addition'} = {}) {
		this.moves = moves;
		this.mode = mode;
	}

	toString() {
		return this.moves.map((move) => moveToString(move)).join(' ');
	}

	push(move) {
		assert(faces.includes(move.face));

		const newMove = {
			face: move.face,
			amount: normalizeAmount(move.amount),
		};

		if (this.length === 0) {
			this.moves.push(newMove);
			return;
		}

		const lastMove = last(this.moves);

		if (lastMove.face !== newMove.face) {
			this.moves.push(newMove);
			return;
		}

		if (this.mode === 'reduction') {
			const newAmount = normalizeAmount(lastMove.amount + newMove.amount);
			if (newAmount === 0) {
				this.moves.pop();
				return;
			}

			last(this.moves).amount = newAmount;
			return;
		}

		if (this.mode === 'addition') {
			if (Math.sign(lastMove.amount) !== Math.sign(newMove.amount)) {
				this.moves.push(newMove);
				return;
			}

			const newAmount = lastMove.amount + newMove.amount;
			if (Math.abs(newAmount) <= 2) {
				last(this.moves).amount = newAmount;
				return;
			}

			last(this.moves).amount = Math.sign(newAmount) * 2;
			newMove.amount = newAmount - Math.sign(newAmount) * 2;

			this.moves.push(newMove);
		}
	}

	unshift(move) {
		assert(faces.includes(move.face));

		const newMove = {
			face: move.face,
			amount: normalizeAmount(move.amount),
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

		if (this.mode === 'reduction') {
			const newAmount = normalizeAmount(firstMove.amount + newMove.amount);
			if (newAmount === 0) {
				this.moves.shift();
				return;
			}

			this.moves[0].amount = newAmount;
			return;
		}

		if (this.mode === 'addition') {
			if (Math.sign(firstMove.amount) !== Math.sign(newMove.amount)) {
				this.moves.unshift(newMove);
				return;
			}

			const newAmount = firstMove.amount + newMove.amount;
			if (Math.abs(newAmount) <= 2) {
				this.moves[0].amount = newAmount;
				return;
			}

			this.moves[0].amount = Math.sign(newAmount) * 2;
			newMove.amount = newAmount - Math.sign(newAmount) * 2;

			this.moves.unshift(newMove);
		}
	}

	// Moves count in terms of HTM turns
	get length() {
		return this.moves.length;
	}
}

MoveSequence.fromScramble = (scramble, options) => {
	const moves = scramble.split(' ').map((moveString) => {
		assert(moveStrings.has(moveString), 'C');
		return {...moveStrings.get(moveString)};
	});
	return new MoveSequence(moves, options);
};

MoveSequence.moveToString = moveToString;

export default MoveSequence;
