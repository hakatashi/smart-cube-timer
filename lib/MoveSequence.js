import {
	faces,
	getNotation,
	getOppositeFace,
	getOrientation,
	getOrientationFromRotation,
	getRelativeFace,
	getRelativeFaceFromFaces,
	mod,
	moveToRotation,
	sliceFaces,
} from '~/lib/utils.js';
import assert from 'assert';
import flatten from 'lodash/flatten';
import last from 'lodash/last';
import sumBy from 'lodash/sumBy';
import tail from 'lodash/tail';

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

const normalizeMove = ({face, amount, width}, {down, left}) => {
	assert(faces.includes(face));

	if (down === null) {
		return {amount, face, width};
	}

	if (left === null) {
		const normalizedFace = getRelativeFace(face, {from: down, to: 'D'});
		return {amount, face: normalizedFace, width};
	}

	const normalizedFace = getRelativeFaceFromFaces(face, {from: [down, left], to: ['D', 'L']});
	return {amount, face: normalizedFace, width};
};

const normalizeAmount = (amount) => (
	mod((amount + 1), 4) - 1
);

const joinMoves = (lastMove, newMove) => {
	if (lastMove.face !== newMove.face) {
		return [lastMove, newMove];
	}

	if (Math.sign(lastMove.amount) !== Math.sign(newMove.amount)) {
		return [lastMove, newMove];
	}

	const newAmount = lastMove.amount + newMove.amount;
	if (Math.abs(newAmount) <= 2) {
		return [
			{
				...lastMove,
				amount: newAmount,
			},
		];
	}

	return [
		{
			...lastMove,
			amount: Math.sign(newAmount) * 2,
		},
		{
			...newMove,
			amount: newAmount - Math.sign(newAmount) * 2,
		},
	];
};

class MoveSequence {
	constructor(moves = [], {mode = 'addition'} = {}) {
		this.moves = moves;
		this.mode = mode;
	}

	toText({cross = null, rouxBlock = null, fixDirection = false, slices = []} = {}) {
		const moves = [];

		if (rouxBlock === null) {
			const cubeOrientation = cross === null ? {
				left: 'L',
				down: 'D',
			} : getOrientation({from: cross, to: 'D'});

			for (const move of this.moves) {
				const newMove = normalizeMove(move, {
					down: cubeOrientation.down,
					left: cubeOrientation.left,
				});
				const lastMove = moves.length !== 0 && last(moves);

				// slice move detection
				if (
					lastMove &&
					getOppositeFace(newMove.face) === lastMove.face &&
					Math.sign(newMove.amount) * Math.sign(lastMove.amount) === -1 // 🤔
				) {
					const slice = slices.find((s) => newMove.face === sliceFaces[s] || lastMove.face === sliceFaces[s]);

					if (slice !== undefined) {
						const direction = -Math.sign([newMove, lastMove].find(({face}) => face === sliceFaces[slice]).amount);
						const amount = Math.min(Math.abs(newMove.amount), Math.abs(lastMove.amount)) * direction;
						const rotation = moveToRotation({
							face: newMove.face,
							amount: -Math.sign(newMove.amount) * Math.abs(amount),
						});
						const newOrientation = getOrientationFromRotation(cubeOrientation, rotation);

						const newMoves = [
							{
								...lastMove,
								amount: lastMove.amount + amount * (Math.sign(lastMove.amount) === direction ? -1 : 1),
							},
							{
								face: slice,
								amount,
								...(lastMove.time === undefined ? {} : {time: lastMove.time}),
							},
							{
								...newMove,
								amount: newMove.amount - amount * (Math.sign(lastMove.amount) === direction ? -1 : 1),
							},
						].filter((m) => m.amount !== 0);

						moves.pop();

						if (this.mode === 'addition' && moves.length > 0) {
							assert(newMoves.length > 0);
							const newJoinedMoves = joinMoves(last(moves), newMoves[0]);
							moves.pop();
							moves.push(...newJoinedMoves, ...tail(newMoves));
						} else {
							moves.push(...newMoves);
						}

						cubeOrientation.left = newOrientation.left;
						cubeOrientation.down = newOrientation.down;

						continue;
					}
				}

				moves.push(newMove);
			}

			return {
				text: moves.map((move) => getNotation(move)).join(' '),
				orientation: cubeOrientation,
			};
		}

		const cubeOrientation = {
			left: rouxBlock.side,
			down: rouxBlock.bottomDirection,
		};

		for (const move of this.moves) {
			if (fixDirection && move.face === cubeOrientation.left) {
				moves.push(normalizeMove({
					face: getOppositeFace(move.face),
					amount: move.amount,
					width: 2,
				}, {
					down: cubeOrientation.down,
					left: cubeOrientation.left,
				}));
				const newDownFace = ['D', 'B', 'U', 'F'][(move.amount + 4) % 4];
				cubeOrientation.down = getRelativeFaceFromFaces(newDownFace, {
					from: ['L', 'D'],
					to: [cubeOrientation.left, cubeOrientation.down],
				});
			} else {
				moves.push(normalizeMove(move, {
					down: cubeOrientation.down,
					left: cubeOrientation.left,
				}));
			}
		}

		return {
			text: moves.map((move) => getNotation(move)).join(' '),
			orientation: cubeOrientation,
		};
	}

	toString(options) {
		return this.toText(options).text;
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

			lastMove.amount = newAmount;
			return;
		}

		if (this.mode === 'addition') {
			this.moves.pop();
			this.moves.push(...joinMoves(lastMove, newMove));
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

			firstMove.amount = newAmount;
			return;
		}

		if (this.mode === 'addition') {
			this.moves.shift();
			this.moves.unshift(...joinMoves(firstMove, newMove).reverse());
		}
	}

	// Moves count in terms of HTM turns
	get length() {
		return this.moves.length;
	}
}

MoveSequence.fromScramble = (scramble, options) => {
	const moves = scramble.split(' ').map((moveString) => {
		assert(moveStrings.has(moveString));
		return {...moveStrings.get(moveString)};
	});
	return new MoveSequence(moves, options);
};

export default MoveSequence;
