import GiiKER from 'giiker';
import Cube from 'cubejs';

export default {
	_giiker: null,
	isConnected: false,
	async connect() {
		if (this._giiker) {
			return this._giiker;
		}

		this._giiker = await GiiKER.connect();
		this.cube = new Cube();
		this.isConnected = true;
		return this._giiker;
	},
	on(...args) {
		return this._giiker.on(...args);
	},
	off(...args) {
		return this._giiker.off(...args);
	},
};
