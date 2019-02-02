import Config from './config';
import Database from './db/database';
import { config } from './const';
import Server from './server/server';
import { constants, IncomingHttpHeaders, ServerHttp2Stream } from 'http2';
import Renderer from './renderer/renderer';

export default class Serve {

	// Properties
	// =========================================================================

	/** The current sites config */
	private readonly _config : config;

	/** The sites content database */
	private readonly _database : Database;

	/** The local dev server */
	private readonly _server : Server;

	private readonly _renderer : Renderer;

	// Constructor
	// =========================================================================

	constructor (port : number) {
		this._config = new Config() as unknown as config;

		this._database = new Database(this._config);

		this._server = new Server(port);

		this._renderer = new Renderer(
			this._config,
			this._database
		);
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
	onStream = async (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
		stream.setDefaultEncoding('utf8');
		stream.setEncoding('utf8');
		const route = headers[constants.HTTP2_HEADER_PATH] as string;

		// @ts-ignore
		const content = this._database.find().route(route, '===').one();

		if (!content) {
			// TODO: Try serving from assets

			stream.respond({
				'content-type': 'text/html',
				':status': 404,
			});

			// TODO: Fallback if no 404 template
			const html = await this._renderer.renderRoute('404', {
				title: '❌ Page not found!',
			});
			stream.end(html);

			return;
		}

		stream.respond({
			'content-type': 'text/html',
			':status': 200,
		});

		const html = await this._renderer.renderRoute(route, content);
		stream.end(html);
	};

}
