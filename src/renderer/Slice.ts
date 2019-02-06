type SliceToken = {
	name: string;
	fixed: boolean;
	output: any;
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
			if (token.fixed) {
				return Twig.parseAsync.call(
					this,
					token.output,
					context
				).then((output : any) => ({
					output,
					chain,
				}));
			}

			if (!this.hasOwnProperty('slices')) {
				// Create the slice object on this template
				this.slices = {};
			}

			// Add it to the output context under the name `__slices`
			// (so {{ __slices.image(__slice_image_0) }} should work?)
			context.__slices = this.slices;

			if (this.slices.hasOwnProperty(token.name))
				return { output: '', chain };

			const template = this;

			this.slices[token.name] = function (key : string) {
				const sliceContext = {
					...context,
					[token.name]: context[key],
				};

				return Twig.parseAsync.call(
					template,
					token.output,
					sliceContext
				);
			};

			return {
				output: '',
				chain,
			};
		},
	});

	Twig.exports.extendTag({
		type: 'endslice',
		regex: /^endslice$/,
		next: [],
		open: false,
	});

}
