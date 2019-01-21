import Config from './config';
import Database from './database';
import { config } from './const';

export default class Serve {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	private _database : Database | null = null;

	// Constructor
	// =========================================================================

	constructor () {
		// TODO: On reload on config file change
		this._config = new Config() as unknown as config;

		this._database = new Database(this._config);
	}

	// Actions
	// =========================================================================

	async run () : Promise<void> {
		console.log('SERVE!');
	}

}
