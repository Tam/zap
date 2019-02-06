import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { config } from './const';

export default class Config {

	// Properties
	// =========================================================================

	/** Absolute path to the config file */
	private readonly _path : string = '';

	/** The config object */
	private _config : any = {};

	// Constructor
	// =========================================================================

	constructor () {
		this._path = path.join(process.cwd(), 'config.yml');

		// 1. Ensure config.yml exists
		if (!this.exists()) {
			console.log(
				'Can\'t find config.yml!',
				'Try running `zap new [path]` to create a new Zap site.'
			);
			process.exit(1);
		}

		// 2. Load and parse config.yml
		const config = this.load();
		this.parse(config);

		return new Proxy(this, {
			get (target: Config | any, key: PropertyKey): any {
				return target._config.hasOwnProperty(key)
					? target._config[key]
					: target[key];
			},
		});
	}

	// Actions
	// =========================================================================

	/**
	 * Checks if the config file exists
	 */
	exists () : boolean {
		return fs.existsSync(this._path);
	}

	/**
	 * Loads the config file into a string
	 */
	load () : string {
		return fs.readFileSync(this._path, {
			encoding: 'utf8'
		});
	}

	/**
	 * Parses the config file into an object
	 *
	 * @param config - The raw config string
	 */
	parse (config : string) : void {
		this._config = yaml.safeLoad(config);
	}

	/**
	 * Returns the config as an object
	 */
	toObject () : object {
		return this._config;
	}

}
