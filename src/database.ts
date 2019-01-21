import { config } from './const';
import Load from './load';

export default class Database {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	private readonly _load : Load;

	// Constructor
	// =========================================================================

	constructor (config : config) {
		this._config = config;

		this._load = new Load(config);

		console.log(this._load.content());
	}

	// Actions
	// =========================================================================

	//

}
