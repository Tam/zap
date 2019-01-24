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
	readonly load : Load;

	/** The Loki database */
	private readonly _db : Loki;

	/** DB collections */
	private readonly _assetsCollection : Collection<any>;
	private readonly _contentCollection : Collection<any>;
	private readonly _templatesCollection : Collection<any>;

	// Constructor
	// =========================================================================

	constructor (config : config) {
		this._config = config;

		this._db = new Loki(Date.now().toString() + '-zap.db');

		this._assetsCollection = this._db.addCollection('assets');
		this._contentCollection = this._db.addCollection('content');
		this._templatesCollection = this._db.addCollection('templates');

		this.load = new Load(config);

		this.load.content().forEach(content => {
			this._contentCollection.insert(content);
		});

		this.load.templates().forEach(template => {
			this._templatesCollection.insert(template);
		});
	}

	// Actions
	// =========================================================================

	/**
	 * Returns a query for the content collection
	 */
	find () : Query {
		return new Query(this._contentCollection);
	}

	/**
	 * Returns a query for the template collection
	 */
	findTemplate () : Query {
		return new Query(this._templatesCollection);
	}

}
