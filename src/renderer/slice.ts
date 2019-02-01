import { Extension } from 'nunjucks';

export default class SliceExtension implements Extension {

	tags : string[] = ['slice'];

	parse (parser : any, nodes : any, lexer : any) {
		const token = parser.nextToken()
			, args = parser.parseSignature(null, true);

		// console.log(args.children);

		// const name = args.children[0].value
		// 	, fixed = args.children.length > 1 && args.children[1].value.toLowerCase() === 'fixed';

		parser.advanceAfterBlockEnd(token.value);

		const body = parser.parseUntilBlocks('endslice');

		parser.advanceAfterBlockEnd();

		console.log(body.children.map((s : any) => s.children));

		return new nodes.CallExtension(this, 'run', args, [ body ]);
	}

	run (context : any, { name, fixed } : any, body : Function) {
		if (!name)
			throw new Error('You must specify a slice name `name="image"`');

		body = body();

		console.log(body);

		return 'XYZZY';
	}

}
