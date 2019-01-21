import fs from 'fs';
import path from 'path';
import { config } from './const';
import Parse from './parse';

export default class Load {

	// Properties
	// =========================================================================

	private readonly _config : config;

	// Constructor
	// =========================================================================

	constructor (_config : config) {
		this._config = _config;
	}

	// Actions
	// =========================================================================

	/**
	 * Loads the content files
	 */
	content () : object {
		const path = Load._cwd(this._config.contentDir);

		const files = Load._walk(
			path,
			[
				'.md',
				'.markdown',
				'.mdown',
				'.mkdn',
				'.mkd',
				'.mdtxt',
				'.mdtext',
				'.text',
				'.Rmd',
			]
		);

		const content : any = {};

		files.forEach(file => {
			const str = fs.readFileSync(file, 'utf8');
			content[file] = Parse.content(str);
		});

		return content;
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

}
