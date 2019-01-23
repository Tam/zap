import Config from './config';
import Database from './db/database';
import { config } from './const';
import Server from './server/server';
import { constants, IncomingHttpHeaders, ServerHttp2Stream } from 'http2';

export default class Serve {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	/** The sites content database */
	private readonly _database : Database;

	/** The local dev server */
	private readonly _server : Server;

	// Constructor
	// =========================================================================

	constructor (port : number) {
		// TODO: On reload on config file change?
		this._config = new Config() as unknown as config;

		this._database = new Database(this._config);

		this._server = new Server(port);
	}

	// Actions
	// =========================================================================

	async run () : Promise<void> {
		this._server.onStream(this.onStream);

		this._server.start();
	}

	// Events
	// =========================================================================

	/**
	 * Handles the servers onStream event, serves the site
	 */
	onStream = (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
		stream.setDefaultEncoding('utf8');
		stream.setEncoding('utf8');
		const route = headers[constants.HTTP2_HEADER_PATH];

		// @ts-ignore
		const content = this._database.find().route(route, '===').one();

		if (!content) {
			// TODO: Try serving from assets

			stream.respond({
				'content-type': 'text/html',
				':status': 404,
			});

			// TODO: Serve pretty 404
			stream.end(`
					<!doctype html>
					<html lang="en">
					<head>
						<meta charset="utf-8" />
						<title>❌ Page not found!</title>
					</head>
					<body>
						<h1>❌ Page not found!</h1>
						<p>We couldn't find a file matching the route <code>${route}</code></p>
					</body>
					</html>
				`);

			return;
		}

		stream.respond({
			'content-type': 'text/html',
			':status': 200,
		});

		stream.end(`
				<!doctype html>
				<html lang="en">
				<head>
					<meta charset="utf-8" />
					<title>${content.title}</title>
				</head>
				<body>
					<pre>${content.content}</pre>
				</body>
				</html>
			`);
	};

}
