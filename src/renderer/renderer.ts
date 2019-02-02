import { config } from '../const';
import Database from '../db/database';
import showdown, { Converter } from 'showdown';
import hljs from 'highlight.js';
import he from 'he';
import Twig from 'twig';
// @ts-ignore
import showdownGhostFootnotes from 'showdown-ghost-footnotes';
import Slice from './Slice';

export default class Renderer {

	// Properties
	// =========================================================================

	private readonly _config : config;

	private readonly _database : Database;

	private readonly _converter : Converter;

	constructor (config : config, db : Database) {
		this._config = config;
		this._database = db;

		// @ts-ignore
		Twig.extend(Slice);

		showdown.setFlavor('github');
		this._converter = new showdown.Converter({
			omitExtraWLInCodeBlocks: true,
			strikethrough: true,
			tables: true,
			tasklists: true,
			noHeaderId: true,
			extensions: [
				this._autoHighlightPlugin(),
				showdownGhostFootnotes,
			],
		});
	}

	// Actions
	// =========================================================================

	renderRoute (route : string, content : any = {}) : Promise<any> {
		const file = this._getTemplateByRoute(route);

		if (!file) {
			return Promise.resolve(
				'TODO: No template error, ' + route
			);
		}

		return new Promise(resolve => {
			Twig.renderFile(file, {
				...content,
				content: this._renderMarkdown(content.content),
				config: this._config,
			}, (err, html) => {
				if (!err)
					return resolve(html);

				// TODO: Nice error page
				console.log(err);
				resolve('<pre><code>' + err.message + '</code></pre>');
			});
		});
	}

	// Helpers
	// =========================================================================

	// Helpers: Templates
	// -------------------------------------------------------------------------

	/**
	 * Gets the template by the given route
	 */
	private _getTemplateByRoute (route : string) : string | null {
		// @ts-ignore
		const template = this._database.findTemplate().route(route).one();

		if (!template)
			return null;

		return template.file;
	}

	// Helpers: Markdown
	// -------------------------------------------------------------------------

	private _renderMarkdown (markdown : string = '') : String {
		return this._markup(
			this._converter.makeHtml(
				markdown.replace(/\t/g, '_XYZZY_TAB_')
			).replace(/_XYZZY_TAB_/g, '\t')
		);
	}

	private _autoHighlightPlugin () : any {
		const classAttr = 'class="';

		hljs.configure({
			tabReplace: '\t',
		});

		return [{
			type: 'output',
			filter (text : any) {
				const left = '<pre><code\\b[^>]*>'
					, right = '</code></pre>'
					, flags = 'g';

				const replacement = (
					wholeMatch : any,
					match : any,
					left : any,
					right : any,
				) => {
					match = he.decode(match);

					const lang = (left.match(/class="([^ "]+)/) || [])[1];

					if (left.includes(classAttr)) {
						const attrIndex = left.indexOf(classAttr) + classAttr.length;
						left = left.slice(0, attrIndex) + 'hljs ' + left.slice(attrIndex);
					} else {
						left = left.slice(0, -1) + ' class="hljs">';
					}

					if (lang && hljs.getLanguage(lang))
						return left + hljs.highlight(lang, match).value + right;

					return left + hljs.highlightAuto(match).value + right;
				};

				return showdown.helper.replaceRecursiveRegExp(
					text,
					replacement,
					left,
					right,
					flags,
				);
			},
		}];
	}

	// Helpers: Twig
	// -------------------------------------------------------------------------

	private _markup (content : string) {
		// @ts-ignore
		const output = new String(content);
		// @ts-ignore
		output.twig_markup = 'html';

		return output;
	}

}
