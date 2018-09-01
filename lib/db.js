/* eslint no-underscore-dangle: off, private-props/no-use-outside: off */

import {formatSerializedDate, formatTime} from '~/lib/utils.js';
import Dexie from 'dexie';
import MoveSequence from '~/lib/MoveSequence.js';
import nanoid from 'nanoid';
import {saveAs} from 'file-saver';

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
db.version(2).stores({
	solves: [
		'id',
		'date',
		'time',
		'mode',
		'scramble',
		'turns',
		'stages',
		'isError',
		'_moveCount',
		'_crossFace',
		'_rouxBlockSide',
		'_rouxBlockBottom',
		'_isXcross',
		'_pllCase',
		'_ollCase',
		'_pllLooks',
		'_ollLooks',
		'_cllCase',
		'_unknownTime',
		'_f2l1Time',
		'_f2l2Time',
		'_f2l3Time',
		'_f2l4Time',
		'_ollTime',
		'_pllTime',
		'_aufTime',
		'_block2Time',
		'_cllTime',
		'_lseoTime',
		'_lsepTime',
	].join(','),
}).upgrade((context) => {
	context.solves.toCollection().modify((solve) => {
		solve.mode = 'cfop';
		solve._unknownTime = solve._crossTime;
		delete solve._crossTime;
	});
});
db.version(3).stores({
	solves: [
		'id',
		'date',
		'time',
		'mode',
		'scramble',
		'turns',
		'stages',
		'isError',
		'_moveCount',
		'_crossFace',
		'_rouxBlockSide',
		'_rouxBlockBottom',
		'_isXcross',
		'_pllCase',
		'_ollCase',
		'_pllLooks',
		'_ollLooks',
		'_cllCase',
		'_unknownTime',
		'_f2l1Time',
		'_f2l2Time',
		'_f2l3Time',
		'_f2l4Time',
		'_ollTime',
		'_pllTime',
		'_aufTime',
		'_block2Time',
		'_cllTime',
		'_lseoTime',
		'_lsepTime',
	].join(','),
	ollStats: [
		'id',
		'count',
		'times',
		'inspectionTimes',
		'executionTimes',
	].join(','),
	pllStats: [
		'id',
		'count',
		'times',
		'inspectionTimes',
		'executionTimes',
	].join(','),
}).upgrade((context) => {
	context.solves.toCollection().modify((solve) => {
		solve.stages = solve.stages.map((stage) => {
			if (stage.id !== 'cross') {
				return stage;
			}

			return {
				id: 'unknown',
				...stage,
			};
		});
	});
});

export default db;

export const saveSolve = async (data) => {
	const id = nanoid();

	// Calculate derived properties

	const {
		crossFace,
		isXcross,
		ollCase,
		pllCase,
		ollLooks,
		pllLooks,
		ollInspection,
		pllInspection,
		cllCase,
		rouxBlockSide,
		rouxBlockBottom,
		moveCount,
	} = data;

	const speed = moveCount / (data.time / 1000);

	const [
		unknownTime,
		f2l1Time,
		f2l2Time,
		f2l3Time,
		f2l4Time,
		ollTime,
		pllTime,
		aufTime,
		block2Time,
		cllTime,
		lseoTime,
		lsepTime,
	] = [
		'unknown',
		'f2l1',
		'f2l2',
		'f2l3',
		'f2l4',
		'oll',
		'pll',
		'auf',
		'block2',
		'cll',
		'lseo',
		'lsep',
	].map((stageId) => {
		const stage = data.stages.find((s) => s.id === stageId);
		if (stage === undefined) {
			return null;
		}
		return stage.time;
	});

	const ret = {};

	ret.solve = await db.solves.put({
		id,
		mode: data.mode,
		date: data.date,
		time: data.time,
		scramble: data.scramble,
		turns: data.turns,
		stages: data.stages,
		isError: data.isError,
		_moveCount: moveCount,
		_speed: speed,
		_crossFace: crossFace,
		_rouxBlockSide: rouxBlockSide,
		_rouxBlockBottom: rouxBlockBottom,
		_isXcross: isXcross,
		_pllCase: pllCase,
		_ollCase: ollCase,
		_pllLooks: pllLooks,
		_ollLooks: ollLooks,
		_cllCase: cllCase,
		_unknownTime: unknownTime,
		_f2l1Time: f2l1Time,
		_f2l2Time: f2l2Time,
		_f2l3Time: f2l3Time,
		_f2l4Time: f2l4Time,
		_ollTime: ollTime,
		_pllTime: pllTime,
		_aufTime: aufTime,
		_block2Time: block2Time,
		_cllTime: cllTime,
		_lseoTime: lseoTime,
		_lsepTime: lsepTime,
	});

	if (typeof ollCase === 'number' && typeof ollInspection === 'number') {
		await db.transaction('rw', db.ollStats, async () => {
			const record = await db.ollStats.get({id: ollCase});
			const recordData = record || {count: 0, times: 0, inspectionTimes: 0, executionTimes: 0};

			ret.ollStat = await db.ollStats.put({
				id: ollCase,
				count: recordData.count + 1,
				times: recordData.times + ollTime,
				inspectionTimes: recordData.inspectionTimes + ollInspection,
				executionTimes: recordData.executionTimes + (ollTime - ollInspection),
			});
		});
	}

	if (typeof pllCase === 'number' && typeof pllInspection === 'number') {
		await db.transaction('rw', db.pllStats, async () => {
			const record = await db.pllStats.get({id: ollCase});
			const recordData = record || {count: 0, times: 0, inspectionTimes: 0, executionTimes: 0};

			ret.pllStat = await db.pllStats.put({
				id: pllCase,
				count: recordData.count + 1,
				times: recordData.times + pllTime,
				inspectionTimes: recordData.inspectionTimes + pllInspection,
				executionTimes: recordData.executionTimes + (pllTime - pllInspection),
			});
		});
	}

	return ret;
};

export const getSolve = async (id) => {
	const solve = await db.solves.get(id);
	return solve;
};

export const getSolves = async () => {
	const solves = await db.solves.where('date').above(new Date('2018-08-09 00:00:00+0900').getTime()).reverse().limit(1000).sortBy('date');
	return solves;
};

export const deleteSolve = (id) => (
	db.solves.delete(id)
);

export const getOllStats = async () => {
	const stats = await db.ollStats.toArray();
	return stats;
};

export const getPllStats = async () => {
	const stats = await db.pllStats.toArray();
	return stats;
};

export const exportTimes = async () => {
	const solves = await db.solves.where('date').above(new Date('2018-08-09 00:00:00+0900').getTime()).reverse().sortBy('date');
	const data = solves.map(({date, scramble, time}) => {
		const sequence = new MoveSequence(scramble);
		const scrambleString = sequence.toString();

		return `"${formatTime(time)}";"${scrambleString}";"${new Date(date).toISOString()}"`;
	}).join('\n');

	const blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, `smart-cube-timer-export-${formatSerializedDate(Date.now())}.txt`);
};
