export default class Query {

	// Properties
	// =========================================================================

	private readonly _collection : Collection<any>;

	private _query : any = {};

	// Constructor
	// =========================================================================

	constructor (collection : Collection<any>) {
		this._collection = collection;

		// TODO: Workout how to allow for dynamic functions in TS
		return new Proxy(this, {
			get (target: Query, key: PropertyKey): any {
				return target._setQueryValue(key);
			}
		});
	}

	// Methods
	// =========================================================================

	limit (amount : number | null) : this {
		// TODO

		return this;
	}

	offset (amount : number) : this {
		// TODO

		return this;
	}

	sort (sorting : string) : this {
		// TODO: handle `title asc, date desc` style sorting

		return this;
	}

	// Returners
	// =========================================================================

	one () : LokiObj | null {
		const result = this._buildQuery().limit(1).data();

		return result.length ? result[0] : null;
	}

	all () : LokiObj[] {
		return this._buildQuery().data();
	}

	// Helpers
	// =========================================================================

	private _setQueryValue (key : PropertyKey) : (value : string) => this {
		return (value : any) : this => {
			this._query[key] = value;
			return this;
		};
	}

	private _buildQuery () : Resultset<LokiObj> {
		// TODO: Build the query

		return this._collection.chain();
	}

}
