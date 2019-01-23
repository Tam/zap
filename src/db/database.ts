import { config } from '../const';
import Load from '../content/load';
import Loki from 'lokijs';
import Query from './query';

export default class Database {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	/** Content loader */
	private readonly _load : Load;

	/** The Loki database */
	private readonly _db : Loki;

	/** Content data collection */
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

	/**
	 * Returns a query for the content database
	 */
	find () : Query {
		return new Query(this._collection);
	}

}