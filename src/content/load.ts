import fs from 'fs';
import path from 'path';
import { config, EXTENSIONS } from '../const';
import Parse from './parse';

export type ContentData = {
	content: string;
	route: string;
	file: string;
	date: Date;
	updated: Date;
	[x: string]: any;
};

export type TemplateData = {
	route: string;
	file: string;
};

export default class Load {

	// Properties
	// =========================================================================

	private readonly _config : config;

	private readonly _assetsPath : string;
	private readonly _contentPath : string;
	private readonly _templatesPath : string;

	// Constructor
	// =========================================================================

	constructor (_config : config) {
		this._config = _config;

		this._assetsPath = Load._cwd(this._config.assetsDir);
		this._contentPath = Load._cwd(this._config.contentDir);
		this._templatesPath = Load._cwd(this._config.templatesDir);
	}

	// Actions
	// =========================================================================

	assets () : any[] {
		// TODO

		return [];
	}

	/**
	 * Loads the content files
	 */
	content () : ContentData[] {
		const files = Load._walk(
			this._contentPath,
			EXTENSIONS.CONTENT
		);

		const content : ContentData[] = [];

		files.forEach(file => {
			content.push(this.contentFile(file));
		});

		return content;
	}

	templates () : TemplateData[] {
		const files = Load._walk(
			this._templatesPath,
			EXTENSIONS.TEMPLATES
		);

		const templates : TemplateData[] = [];

		files.forEach(file => {
			templates.push(this.templateFile(file));
		});

		return templates;
	}

	// Actions: Loaders
	// -------------------------------------------------------------------------

	assetFile (file : string) : any {
		// TODO
	}

	contentFile (file : string) : ContentData {
		const str = fs.readFileSync(file, 'utf8')
			, stats = fs.statSync(file)
			, route = Load._route(file, this._contentPath);

		const fileData = Parse.content(str);

		// @ts-ignore
		delete fileData.isEmpty;
		delete fileData.excerpt;

		return {
			// Overridable
			date: stats.ctime,
			updated: stats.mtime,

			// User
			...fileData.data,

			// Fixed
			content: fileData.content,
			route,
			file,
		};
	}

	templateFile (file : string) : any {
		return {
			route: Load._route(file, this._templatesPath),
			file,
		};
	}

	// Helpers
	// =========================================================================

	/**
	 * Concatenates the given path to the current working directory
	 *
	 * @param _path - Path to concat
	 */
	private static _cwd (_path : string) {
		return path.join(process.cwd(), _path);
	}

	/**
	 * Walks the given path, listing all files recursively
	 *
	 * @param _path - Path to walk
	 * @param whitelist - Array of allowed file extensions, i.e. ['md', 'markdown']
	 * @param fileList - Existing file list (used for recursion)
	 */
	private static _walk (
		_path : string,
		whitelist : string[] = [],
		fileList : string[] = []
	) : string[] {
		fs.readdirSync(_path).forEach(file => {
			const filePath = path.join(_path, file);

			if (fs.statSync(filePath).isDirectory()) {
				fileList = Load._walk(filePath, whitelist, fileList);
				return;
			}

			const ext = path.extname(filePath);

			if (whitelist.length > 0 && whitelist.indexOf(ext) === -1)
				return;

			fileList.push(filePath);
		});

		return fileList;
	}

	/**
	 * Converts the absolute file path into a route
	 *
	 * @param file - File path
	 * @param _path - Directory path
	 */
	private static _route (file : string, _path : string) : string {
		let route = file
			.replace(_path, '')
			.replace(path.extname(file), '');

		if (route.endsWith('index'))
			route = route.slice(0, -5);

		if (route.length > 1 && route.startsWith('/'))
			route = route.replace(/^\//g, '');

		return route;
	}

}
