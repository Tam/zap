import program from 'commander';
import New from './new';
import Serve from './serve';
import { ZAP } from './const';

const pkg = require('../package.json');

export default class Zap {

	/**
	 * Do all the things
	 */
	static async run () {
		console.clear();

		// Change the title in the terminal (important)
		const title = '⚡️ Zap';
		process.title = title;
		process.stdout.write(
			String.fromCharCode(27)
			+ ']0;' + title
			+ String.fromCharCode(7)
		);

		// Do everything else.
		program
			.version(pkg.version, '-v, --version')
			.description(ZAP + '\n' + pkg.description);

		program
			.command('new [path]')
			.description('Creates a new Zap site')
			.action(Zap.new);

		program
			.command('serve')
			.option('-p, --port <n>', 'Set the server port', 8080)
			.description('Starts the local development server')
			.action(Zap.serve);

		program
			.command('build')
			.description('Generates static files for production')
			.action(Zap.build);

		program.parse(process.argv);

		if (!program.args.length)
			program.help();
	}

	// Actions
	// =========================================================================

	/**
	 * Creates a new Zap site, simply by cloning the boilerplate folder
	 * structure into the given location.
	 *
	 * @param path - The location to create the new site, defaults to
	 *     the current location if not set.
	 */
	static async new (path : string = '.') : Promise<void> {
		await New.run(path);
	}

	/**
	 * Starts the local development server.
	 * Also watches the site files for any changes and compiles / reloads
	 * accordingly.
	 */
	static async serve (cmd : any) : Promise<void> {
		await (new Serve(+cmd.port)).run();
	}

	/**
	 * Builds the site into static files ready for deployment to a server.
	 */
	static async build () : Promise<void> {
		console.log('BUILD!');
	}

}
