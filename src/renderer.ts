import { config } from './const';
import nunjucks, { runtime } from 'nunjucks';
import Database from './db/database';
import showdown, { Converter } from 'showdown';
import SafeString = runtime.SafeString;
import hljs from 'highlight.js';
import he from 'he';
// @ts-ignore
import showdownGhostFootnotes from 'showdown-ghost-footnotes';


export default class Renderer {

	// Properties
	// =========================================================================

	private readonly _config : config;

	private readonly _database : Database;

	private readonly _env : any;

	private readonly _converter : Converter;

	constructor (config : config, db : Database) {
		this._config = config;
		this._database = db;

		this._env = nunjucks.configure(config.templatesDir);
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

	renderRoute (route : string, content : any = {}) : string {
		const file = this._getTemplateByRoute(route);

		return this._env.render(file, {
			...content,
			content: this._renderMarkdown(content.content),
			config: this._config,
		});
	}

	// Helpers
	// =========================================================================

	// Helpers: Templates
	// -------------------------------------------------------------------------

	/**
	 * Gets the template by the given route
	 */
	private _getTemplateByRoute (route : string) : string {
		// @ts-ignore
		const template = this._database.findTemplate().route(route).one();

		if (!template)
			return 'TODO: Fallback template';

		return template.file;
	}

	// Helpers: Markdown
	// -------------------------------------------------------------------------

	private _renderMarkdown (markdown : string = '') : SafeString {
		return new SafeString(
			this._converter.makeHtml(
				markdown.replace(/\t/g, '_XYZZY_TAB_')
			).replace(/_XYZZY_TAB_/g, '\t'),
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

}
