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
		if (!await New.validatePath(path))
			return;

		// 2. Inquirer all the settings in the config file and write out
		this._loadConfig();

		await this.configQuestionnaire();

		console.log(path, this._config);

		// 3. Create directories and copy other scaffold files
		// TODO
	}

	/**
	 * Validates the given path to ensure it exists, is writable, and is empty
	 *
	 * @param path - The path to validate
	 */
	static async validatePath (path : string) : Promise<boolean> {
		// Create dir if doesn't exist
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path, {
				recursive: true,
			});

			return true;
		}

		// Ensure we can access existing dir
		try {
			fs.accessSync(path);
		} catch (e) {
			console.log(
				'Unable to access ' + path +
				', please check permissions and try again!'
			);

			return false;
		}

		// Check if dir is empty
		const files = fs.readdirSync(path);

		if (files.length === 0)
			return true;

		// Allow the user to proceed at their own risk
		// (good if something like .git already exists)
		const { proceed } = await inquirer.prompt([
			{
				type: 'confirm',
				name: 'proceed',
				default: false,
				message:
					'Directory \'' + path +
					'\' isn\'t empty, proceed anyway ' +
					'(may cause issues or files to be deleted)?'
			}
		]);

		return proceed;
	}

	/**
	 * Allows the user to customise the config file through a series of
	 * questions
	 */
	async configQuestionnaire () : Promise<void> {
		const when = (answers : any) => answers._confirm;

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
			},
			{
				type: 'input',
				name: 'webDir',
				message: 'Web Directory',
				default: this._config.webDir,
				when,
			},
			{
				type: 'input',
				name: 'assetsDir',
				message: 'Assets Directory',
				default: this._config.assetsDir,
				when,
			},
			{
				type: 'input',
				name: 'contentDir',
				message: 'Content Directory',
				default: this._config.contentDir,
				when,
			},
			{
				type: 'input',
				name: 'templatesDir',
				message: 'Templates Directory',
				default: this._config.templatesDir,
				when,
			},
		]);

		delete answers._confirm;

		this._config = {
			...this._config,
			...answers,
		};

		[
			'url',
			'webDir',
			'assetsDir',
			'contentDir',
			'templatesDir',
		].forEach(key => {
			this._config[key] = New._trimSlashes(this._config[key]);
		});
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

	/**
	 * Will trim the slashes of the given string
	 *
	 * @param value - String to trim
	 */
	private static _trimSlashes (value : string) : string {
		return value.replace(/^\/+|\/+$/, '');
	}

}

export default new New();
