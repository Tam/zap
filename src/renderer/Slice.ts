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
