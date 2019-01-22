import { config } from './const';
import Load from './load';
import Loki from 'lokijs';
import Query from './query';

export default class Database {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	private readonly _load : Load;

	private readonly _db : Loki;
	private readonly _collection : Collection<any>;

	// Constructor
	// =========================================================================

	constructor (config : config) {
		this._config = config;

		this._db = new Loki(Date.now().toString() + '-zap.db');
		this._collection = this._db.addCollection('content');

		this._load = new Load(config);

		this._load.content().forEach(content => {
			this._collection.insert(content);
		});
	}

	// Actions
	// =========================================================================

	find () : Query {
		return new Query(this._collection);
	}

}
