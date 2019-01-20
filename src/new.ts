import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { ZAP } from './const';

class New {

	// Properties
	// =========================================================================

	// Properties: Private
	// -------------------------------------------------------------------------

	/** The raw scaffold config file */
	private _configScaffold : string = '';

	/** The config for the new site */
	private _config : any = {};

	// Actions
	// =========================================================================

	/**
	 * Starts everything to do with create a new Zap site
	 *
	 * @param path - The path to copy the scaffold to
	 */
	async run (path : string) : Promise<void> {
		console.log(ZAP);

		// 1. Check the path exists (create if it doesn't), and is empty
		// TODO

		// 2. Inquirer all the settings in the config file and write out

		this._loadConfig();

		await this.configQuestionnaire();

		console.log(path, this._config);

		// 3. Create directories and copy other scaffold files
		// TODO
	}

	async configQuestionnaire () : Promise<void> {
		const answers : any = await inquirer.prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Your site\'s name',
				default: this._config.name,
			},
			{
				type: 'input',
				name: 'url',
				message: 'The URL (w/o trailing slash or subdirectories)',
				default: this._config.url,
			},
			{
				type: 'input',
				name: 'root',
				message: 'Site root (i.e. /blog/)',
				default: this._config.root,
			},
			{
				type: 'confirm',
				name: '_confirm',
				message: 'Would you like to configure the directories?',
				default: false,
			}
			// TODO: If yes to above, allow setting of dir names
		]);

		delete answers._confirm;

		this._config = {
			...this._config,
			...answers,
		};
	}

	// Helpers
	// =========================================================================

	/**
	 * Loads the config scaffold into a string and parses it into an object
	 */
	private _loadConfig () : void {
		this._configScaffold = fs.readFileSync(
			path.join(__dirname, '../scaffold/config.yml'),
			'utf8'
		);

		const config = yaml.safeLoad(this._configScaffold);

		for (let [ key, value ] of Object.entries(config))
			config[key] = New._parseValuePlaceholder(value as string);

		this._config = config;
	}

	/**
	 * Parses the placeholder value and returns the defined fallback
	 *
	 * @param value - The value to parse
	 */
	private static _parseValuePlaceholder (value : string) : string {
		const matches = /§\w*§(.*)§/gm.exec(value);

		return matches && matches.length > 1 ? matches[1] : value;
	}

}

export default new New();
