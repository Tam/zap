export default class Query {

	// Properties
	// =========================================================================

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

	limit (amount : number | null) : this {
		this._queryOpts.limit = amount;

		return this;
	}

	offset (amount : number) : this {
		this._queryOpts.offset = amount;

		return this;
	}

	sort (sorting : string) : this {
		const sortOpts : [string, boolean][] = [];

		sorting.split(',').forEach(pair => {
			const [field, dir] = pair.split(' ');

			sortOpts.push([
				field,
				dir === 'desc'
			]);
		});

		this._queryOpts.sorting = sortOpts;

		return this;
	}

	// Returners
	// =========================================================================

	one () : LokiObj | null {
		this.limit(null);

		const result = this._buildQuery().limit(1).data();

		return result.length ? result[0] : null;
	}

	all () : LokiObj[] {
		return this._buildQuery().data();
	}

	// Helpers
	// =========================================================================

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
