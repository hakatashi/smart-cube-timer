/* eslint no-underscore-dangle: off, private-props/no-use-outside: off */

import {formatSerializedDate, formatTime} from '~/lib/utils.js';
import Dexie from 'dexie';
import MoveSequence from '~/lib/MoveSequence.js';
import SolveAnalyzer from '~/lib/SolveAnalyzer.js';
import nanoid from 'nanoid';
import omit from 'lodash/omit';
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
/*
db.version(4).stores({
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
		'_pllInspection',
		'_ollInspection',
		'_cllInspection',
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
	cllStats: [
		'id',
		'count',
		'times',
		'inspectionTimes',
		'executionTimes',
	].join(','),
}).upgrade(async (transaction) => {
	const ollStats = new Map();
	const pllStats = new Map();
	const cllStats = new Map();

	await transaction.solves.toCollection().modify((solve) => {
		const analyzer = new SolveAnalyzer({scramble: solve.scramble});
		analyzer.pushMoves(solve.turns);
		const entry = analyzer.toSolveEntry({
			time: solve.time,
			date: solve.date,
			isError: solve.isError,
		});
		Object.assign(solve, omit(entry, ['id', 'date', 'time', 'scramble', 'turns', 'isError']));

		if (typeof entry._ollCase === 'number' && typeof entry._ollInspection === 'number') {
			const record = ollStats.get(entry._ollCase) || {count: 0, times: 0, inspectionTimes: 0, executionTimes: 0};
			ollStats.set(entry._ollCase, {
				count: record.count + 1,
				times: record.times + entry._ollTime,
				inspectionTimes: record.inspectionTimes + entry._ollInspection,
				executionTimes: record.executionTimes + (entry._ollTime - entry._ollInspection),
			});
		}

		if (typeof entry._pllCase === 'number' && typeof entry._pllInspection === 'number') {
			const record = pllStats.get(entry._pllCase) || {count: 0, times: 0, inspectionTimes: 0, executionTimes: 0};

			pllStats.set(entry._pllCase, {
				count: record.count + 1,
				times: record.times + entry._pllTime,
				inspectionTimes: record.inspectionTimes + entry._pllInspection,
				executionTimes: record.executionTimes + (entry._pllTime - entry._pllInspection),
			});
		}

		if (typeof entry._cllCase === 'number' && typeof entry._cllInspection === 'number') {
			const record = cllStats.get(entry._cllCase) || {count: 0, times: 0, inspectionTimes: 0, executionTimes: 0};

			cllStats.set(entry._cllCase, {
				count: record.count + 1,
				times: record.times + entry._cllTime,
				inspectionTimes: record.inspectionTimes + entry._cllInspection,
				executionTimes: record.executionTimes + (entry._cllTime - entry._cllInspection),
			});
		}
	});

	await transaction.ollStats.clear();
	await transaction.ollStats.bulkPut([...ollStats.entries()].map(([id, stat]) => (({
		id,
		...stat,
	}))));

	await transaction.pllStats.clear();
	await transaction.pllStats.bulkPut([...pllStats.entries()].map(([id, stat]) => (({
		id,
		...stat,
	}))));

	await transaction.cllStats.clear();
	await transaction.cllStats.bulkPut([...cllStats.entries()].map(([id, stat]) => (({
		id,
		...stat,
	}))));
});
*/

export default db;

export const saveSolve = async (data) => {
	const id = nanoid();

	const {
		_ollCase: ollCase,
		_pllCase: pllCase,
		_ollInspection: ollInspection,
		_pllInspection: pllInspection,
		_ollTime: ollTime,
		_pllTime: pllTime,
	} = data;

	const ret = {};

	ret.solve = await db.solves.put({
		...data,
		id,
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

export const dump = async () => {
	const solves = await db.solves.where('date').above(new Date('2018-08-09 00:00:00+0900').getTime()).reverse().sortBy('date');
	const blob = new Blob([JSON.stringify(solves)], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, `smart-cube-timer-dump-${formatSerializedDate(Date.now())}.json`);
};
