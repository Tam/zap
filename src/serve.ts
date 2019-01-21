import Config from './config';
import Database from './database';
import { config } from './const';

export default class Serve {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	/** The sites content database */
	private readonly _database : Database;

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
		console.log(this._database.find({
			route: '/',
		}).limit(1).data());
	}

}
