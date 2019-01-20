import Config from './config';

class Serve {

	// Properties
	// =========================================================================

	private _config : object = {};

	// Actions
	// =========================================================================

	async run () : Promise<void> {
		// TODO: On reload on config file change
		this._config = new Config();

		console.log('SERVE!');
	}

}

export default new Serve();
