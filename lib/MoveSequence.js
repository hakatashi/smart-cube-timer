import assert from 'assert';
import {getOppositeFace, getRelativeFace, mod} from '~/lib/utils.js';
import last from 'lodash/last';
import sumBy from 'lodash/sumBy';
import flatten from 'lodash/flatten';

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

const moveToString = (move, {cross} = {}) => {
	assert(faces.includes(move.face));

	const normalizedFace = cross ? getRelativeFace(move.face, {from: cross, to: 'D'}) : move.face;

	if (move.amount === 1) {
		return normalizedFace;
	}

	if (move.amount === 2) {
		return `${normalizedFace}2`;
	}

	if (move.amount === -1) {
		return `${normalizedFace}'`;
	}

	assert(move.amount === -2);
	return `${normalizedFace}2'`;
};

const normalizeAmount = (amount) => (
	((amount + 1) % 4 + 4) % 4 - 1
);

class MoveSequence {
	constructor(moves = [], {mode = 'addition'} = {}) {
		this.moves = moves;
		this.mode = mode;
	}

	toString({cross} = {}) {
		return this.moves.map((move) => moveToString(move, {cross})).join(' ');
	}

	toObject({cross} = {}) {
		return this.moves.map((move) => {
			const normalizedFace = cross ? getRelativeFace(move.face, {from: cross, to: 'D'}) : move.face;
			return {
				face: normalizedFace,
				...move,
			};
		});
	}

	// Get first move which is not U-turn or canceled by the following move
	// TODO: Cancel U D U' D'
	getFirstNonTrivialMove({cross = null} = {}) {
		let moves = this.toObject({cross});
		let hasCanceledMoves = true;

		while (hasCanceledMoves) {
			hasCanceledMoves = false;

			// Make chunks by sequencial face moves
			const chunks = [];
			for (const move of moves) {
				if (chunks.length === 0) {
					chunks.push([move]);
				} else if (last(chunks)[0].face === move.face) {
					last(chunks).push(move);
				} else {
					chunks.push([move]);
				}
			}

			for (const [index, chunk] of chunks.entries()) {
				assert(chunk.length !== 0);

				if (chunk.length === 1) {
					continue;
				}

				hasCanceledMoves = true;
				const amount = mod(sumBy(chunk, (move) => move.amount), 4);
				if (amount === 0) {
					chunks[index] = [];
				} else {
					chunks[index] = [{...last(chunk), amount}];
				}
			}

			moves = flatten(chunks);
		}

		if (cross === null) {
			return moves[0] || null;
		}

		const topFace = getOppositeFace(cross);
		if (moves.length === 0 || moves[0].face === topFace) {
			return moves[1] || null;
		}
		return moves[0] || null;
	}

	push(move) {
		assert(faces.includes(move.face));

		const newMove = {
			face: move.face,
			amount: normalizeAmount(move.amount),
			...(move.time === undefined ? {} : {time: move.time}),
		};

		if (this.length === 0 || this.mode === 'raw') {
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
			...(move.time === undefined ? {} : {time: move.time}),
		};

		if (this.length === 0 || this.mode === 'raw') {
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
