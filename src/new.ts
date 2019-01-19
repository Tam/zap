import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

class New {

	// Properties
	// =========================================================================

	// Properties: Private
	// -------------------------------------------------------------------------

	/**
	 * @var {string} _configScaffold - The raw scaffold config file
	 * @private
	 */
	private _configScaffold : string = '';

	// Actions
	// =========================================================================

	/**
	 * Starts everything to do with create a new Zap site
	 *
	 * @param {string} path - The path to copy the scaffold to
	 */
	async run (path : string) : Promise<void> {
		// 1. Check the path exists (create if it doesn't), and is empty
		// 2. Inquirer all the settings in the config file and write out
		// 3. Create directories and copy other scaffold files

		const config = this._loadConfig();

		console.log(path, config);
	}

	// Helpers
	// =========================================================================

	/**
	 * Loads the config scaffold into a string
	 *
	 * @return string
	 * @private
	 */
	private _loadConfigScaffold () : string {
		if (this._configScaffold)
			return this._configScaffold;

		return this._configScaffold = fs.readFileSync(
			path.join(__dirname, '../scaffold/config.yml'),
			'utf8'
		);
	}

	/**
	 * Parses the raw config scaffold, returning it as an object
	 *
	 * @return Object
	 * @private
	 */
	private _loadConfig () : Object {
		const config = yaml.safeLoad(
			this._loadConfigScaffold()
		);

		for (let [ key, value ] of Object.entries(config))
			config[key] = New._parseValuePlaceholder(value as string);

		return config;
	}

	/**
	 * Parses the placeholder value and returns the defined fallback
	 *
	 * @param {string} value - The value to parse
	 * @return string
	 * @private
	 */
	private static _parseValuePlaceholder (value : string) : string | null {
		const matches = /§\w*§(.*)§/gm.exec(value);

		return matches && matches.length > 1 ? matches[1] : null;
	}

}

export default new New();
