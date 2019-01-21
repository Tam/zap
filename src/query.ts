export default class Query {

	// Properties
	// =========================================================================

	private readonly _collection : Collection<any>;

	// Constructor
	// =========================================================================

	constructor (collection : Collection<any>) {
		this._collection = collection;
	}

	// Methods
	// =========================================================================

	find (query : any) : this {
		// TODO: Is there a nicer way to handle querying, rather than an obj?
		// Perhaps a getter to allow for `.title('hello')`?

		return this;
	}

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

	one () : any[] {
		return this._buildQuery().limit(1).data();
	}

	all () : any[] {
		return this._buildQuery().data();
	}

	// Helpers
	// =========================================================================

	private _buildQuery () : Resultset<LokiObj> {
		// TODO: Build the query

		return this._collection.chain();
	}

}
