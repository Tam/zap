import { config } from '../const';
import Database from '../db/database';
import showdown, { Converter } from 'showdown';
import hljs from 'highlight.js';
import he from 'he';
import Twig from 'twig';
// @ts-ignore
import showdownGhostFootnotes from 'showdown-ghost-footnotes';
import Slice from './Slice';
import Parse from '../content/parse';

export default class Renderer {

	// Properties
	// =========================================================================

	private readonly _config : config;

	private readonly _database : Database;

	private readonly _converter : Converter;

	private _sliceData : any = {};

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
				this._slicePlugin(),
				showdownGhostFootnotes,
			],
		});
	}

	// Actions
	// =========================================================================

	renderRoute (route : string, content : any = {}) : Promise<any> {
		this._sliceData = {};

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
				config: this._config._config,
				...this._sliceData,
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
			// ).replace(/_XYZZY_TAB_/g, '\t')
			).replace(/_XYZZY_TAB_/g, '<span class="tab"></span>')
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

	private _slicePlugin () : any {
		const rgx = /---[\r\n]([a-zA-Z]\w*):[\r\n][\S\s]*?[\r\n]---/gm
			, sliceIndexes : any = {};

		return [{
			type: 'lang',
			filter: (text : string) => {
				let m;

				while ((m = rgx.exec(text)) !== null) {
					if (m.index === rgx.lastIndex)
						rgx.lastIndex++;

					const [full, name] = m;

					if (!sliceIndexes.hasOwnProperty(name))
						sliceIndexes[name] = -1;

					sliceIndexes[name]++;

					const handle = `__slice_${name}_${sliceIndexes[name]}`;

					this._sliceData[handle] = Parse.content(full).data[name];

					console.log(handle);

					text = text.replace(
						full,
						`{{ __slices.${name}(${handle}) }}`
					);

					this._sliceData[handle] = Parse.content(full).data[name];
				}

				return text;
			},
		}];
	}

	// Helpers: Twig
	// -------------------------------------------------------------------------

	private _markup (content : string) {
		// @ts-ignore
		// noinspection JSPrimitiveTypeWrapperUsage
		const output = new String(content);
		// @ts-ignore
		// noinspection JSPrimitiveTypeWrapperUsage
		output.twig_markup = 'html';

		return output;
	}

}
