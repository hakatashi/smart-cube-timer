import GiiKER from 'giiker';
import Cube from 'cubejs';

export default {
	_giiker: null,
	_moveHandlers: [],
	cube: null,
	isConnected: false,
	async connect() {
		if (this._giiker) {
			return this._giiker;
		}

		this._giiker = await GiiKER.connect();
		this.cube = new Cube();
		this.isConnected = true;

		this._giiker.on('move', (move) => {
			this.cube.move(move.notation.replace(/2'$/, '2'));
			for (const handler of this._moveHandlers) {
				handler(move);
			}
		});

		return this._giiker;
	},
	on(name, handler) {
		if (name === 'move') {
			this._moveHandlers.push(handler);
		} else {
			return this._giiker.on(name, handler);
		}
	},
	off(name, handler) {
		if (name === 'move') {
			this._moveHandlers = this._moveHandlers.filter((h) => h !== handler);
		} else {
			return this._giiker.off(name, handler);
		}
	},
};
