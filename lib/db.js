/* eslint no-underscore-dangle: off, private-props/no-use-outside: off */

import Dexie from 'dexie';
import nanoid from 'nanoid';

const db = new Dexie('database');
db.version(1).stores({
	solves: [
		'id',
		'date',
		'time',
		'scramble',
		'turns',
		'stages',
		'isError',
		'_moveCount',
		'_crossFace',
		'_isXcross',
		'_pllCase',
		'_ollCase',
		'_pllLooks',
		'_ollLooks',
		'_crossTime',
		'_f2l1Time',
		'_f2l2Time',
		'_f2l3Time',
		'_f2l4Time',
		'_ollTime',
		'_pllTime',
		'_aufTime',
	].join(','),
});

export default db;

export const saveSolve = async (data) => {
	const id = nanoid();

	// Calculate derived properties

	const {
		crossFace,
		isXcross,
		pllCase,
		ollCase,
		pllLooks,
		ollLooks,
		moveCount,
	} = data;

	const speed = moveCount / (data.time / 1000);

	const [
		crossTime,
		f2l1Time,
		f2l2Time,
		f2l3Time,
		f2l4Time,
		ollTime,
		pllTime,
		aufTime,
	] = [
		'cross',
		'f2l1',
		'f2l2',
		'f2l3',
		'f2l4',
		'oll',
		'pll',
		'auf',
	].map((stageId) => {
		const stage = data.stages.find((s) => s.id === stageId);
		if (stage === undefined) {
			return null;
		}
		return stage.time;
	});

	await db.solves.put({
		id,
		date: data.date,
		time: data.time,
		scramble: data.scramble,
		turns: data.turns,
		stages: data.stages,
		isError: data.isError,
		_moveCount: moveCount,
		_speed: speed,
		_crossFace: crossFace,
		_isXcross: isXcross,
		_pllCase: pllCase,
		_ollCase: ollCase,
		_pllLooks: pllLooks,
		_ollLooks: ollLooks,
		_crossTime: crossTime,
		_f2l1Time: f2l1Time,
		_f2l2Time: f2l2Time,
		_f2l3Time: f2l3Time,
		_f2l4Time: f2l4Time,
		_ollTime: ollTime,
		_pllTime: pllTime,
		_aufTime: aufTime,
	});
};

export const getSolves = async () => {
	const solves = await db.solves.where('date').above(new Date('2018-08-09 00:00:00+0900').getTime()).reverse().limit(300).sortBy('date');
	return solves;
};
