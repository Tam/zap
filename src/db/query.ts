import { ContentData } from '../content/load';

export default class Query {

	// Properties
	// =========================================================================

	/** The collection to query */
	private readonly _collection : Collection<any>;

	/** Field options */
	private _fieldOpts : any = {};

	/** Query options */
	private _queryOpts : any = {
		limit: null,
		offset: 0,
		sorting: [['date', false]],
	};

	// Constructor
	// =========================================================================

	constructor (collection : Collection<any>) {
		this._collection = collection;

		// TODO: Workout how to allow for dynamic functions in TS
		// https://github.com/Microsoft/TypeScript/issues/20846?
		return new Proxy(this, {
			get (target: Query, key: PropertyKey): any {
				return target._setQueryValue(key);
			},
		});
	}

	// Methods
	// =========================================================================

	/**
	 * Number of results to limit to
	 */
	limit (amount : number | null) : this {
		this._queryOpts.limit = amount;

		return this;
	}

	/**
	 * Number of results to offset by
	 */
	offset (amount : number) : this {
		this._queryOpts.offset = amount;

		return this;
	}

	/**
	 * Sort the results
	 * `.sort('title asc, date desc')`
	 */
	sort (sorting : string) : this {
		const sortOpts : [string, boolean][] = [];

		sorting.split(',').forEach(pair => {
			const [field, dir] = pair.split(' ');

			sortOpts.push([
				field,
				dir.toLowerCase() === 'desc'
			]);
		});

		this._queryOpts.sorting = sortOpts;

		return this;
	}

	// Returners
	// =========================================================================

	/**
	 * Return the first result
	 */
	one () : LokiObj | ContentData | null {
		this.limit(null);

		const result = this._buildQuery().limit(1).data();

		return result.length ? result[0] : null;
	}

	/**
	 * Return all results
	 */
	all () : LokiObj[] | ContentData[] {
		return this._buildQuery().data();
	}

	// Helpers
	// =========================================================================

	/**
	 * Returns a function to set the value and selector of the given key (field)
	 */
	private _setQueryValue (key : PropertyKey) : (value : any, selector ?: string) => this {
		return (value : any, selector : string = '===') : this => {
			selector = Query._convertSelector(
				selector,
				value instanceof Date
			);

			this._fieldOpts[key] = {
				[selector]: value,
			};

			return this;
		};
	}

	/**
	 * Builds the query
	 */
	private _buildQuery () : Resultset<LokiObj> {
		let chain = this._collection.chain();

		chain = chain.find(this._fieldOpts);

		const { limit, offset, sorting } = this._queryOpts;

		if (limit)
			chain = chain.limit(limit);

		if (offset)
			chain = chain.offset(offset);

		if (sorting)
			chain = chain.simplesort(sorting);

		return chain;
	}

	/**
	 * Converts our friendly selectors into Loki ones
	 */
	private static _convertSelector (selector : string, isDate : boolean) : string {
		switch (selector) {
			case '!==':
				return '$ne';
			case '==':
				return '$aeq';
			case '>':
				return '$gt';
			case '>=':
				return '$gte';
			case '<':
				return '$lt';
			case '<=':
				return '$lte';
			case 'between':
				return '$between';
			case 'regex':
				return '$regex';
			case 'in':
				return '$in';
			case 'not in':
				return '$nin';
			case 'contains':
				return '$contains';
			case 'not contains':
				return '$containsNone';
			case '':
			case '===':
			default:
				return isDate ? '$dteq' : '$eq';
		}
	}

}
