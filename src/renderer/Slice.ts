type SliceToken = {
	name: string;
	fixed: boolean;
};

export default function Slice (Twig : any) {

	Twig.exports.extendTag({
		type: 'slice',
		regex: /^slice\s([a-zA-Z0-9_]+)(\sfixed)?$/,
		next: ['endslice'],
		open: true,
		compile (token : any) {
			const name = token.match[1]
				, fixed = !!token.match[2];

			delete token.match;

			return { ...token, name, fixed };
		},
		parse (token : SliceToken, context : any, chain : any) {
			// https://github.com/twigjs/twig.js/wiki/Extending-twig.js-With-Custom-Tags
			// https://github.com/twigjs/twig.js/blob/e901f9ec7da9a9407126eda75bb59a8e4ce665b0/src/twig.logic.js#L841-L934
			console.log(token, context, chain);
		},
	});

	Twig.exports.extendTag({
		type: 'endslice',
		regex: /^endslice$/,
		next: [],
		open: false,
	});

}
