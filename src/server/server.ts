import http2, {
	Http2SecureServer,
	Http2ServerRequest,
	Http2ServerResponse, IncomingHttpHeaders, ServerHttp2Stream,
} from 'http2';
import path from 'path';
import fs from 'fs';
// @ts-ignore
import selfSigned from 'selfsigned';

export default class Server {

	// Properties
	// =========================================================================

	private readonly _port : number;

	private readonly _server : Http2SecureServer;

	// Constructor
	// =========================================================================

	constructor (port : number) {
		this._port = port;

		const cert = Server.cert();

		this._server = http2.createSecureServer({
			...cert,
		});
	}

	// Actions
	// =========================================================================

	/**
	 * Starts the server listening on the port
	 */
	start () : void {
		// TODO: Check if port is available, offer alternative if not

		this._server.listen(this._port);

		console.log(
			'Server started: https://localhost:' + this._port.toString()
		);
	}

	/**
	 * Gets the SSL cert
	 */
	private static cert () {
		const certDir = path.join(
			__dirname,
			'../../.certs'
		);

		const certPath = path.join(
			certDir,
			process.cwd().replace(/[\W_]+/g, '_') + '.pem'
		);

		console.log(certPath);

		let certExists = fs.existsSync(certPath);

		if (certExists) {
			const certTtl = 1000 * 60 * 60 * 24
				, certStat = fs.statSync(certPath)
				, now = new Date().getTime();

			// If the cert is older than 30 days, delete it
			if ((now - certStat.ctime.getTime()) / certTtl > 30) {
				console.log('Removing old SSL certificate');

				fs.unlinkSync(certPath);

				certExists = false;
			}
		}

		if (!certExists) {
			console.log('Generating SSL certificate.');

			const attrs = [
				{ name: 'commonName', value: 'localhost' },
			];

			const pems = Server._createCert(attrs);

			if (!fs.existsSync(certDir))
				fs.mkdirSync(certDir, { recursive: true });

			fs.writeFileSync(
				certPath,
				pems.private + pems.cert,
				{ encoding: 'utf-8' }
			);
		}

		const selfCert = fs.readFileSync(certPath);

		return {
			key: selfCert,
			cert: selfCert,
		};
	}

	// Events
	// =========================================================================

	/**
	 * On server stream
	 */
	onStream (listener: (stream: ServerHttp2Stream, headers: IncomingHttpHeaders, flags: number) => void) {
		this._server.on('stream', listener);
	}

	// Helpers
	// =========================================================================

	/**
	 * Creates a self-signed SSL cert
	 */
	private static _createCert (attrs : object[]) {
		return selfSigned.generate(attrs, {
			algorithm: 'sha256',
			days: 30,
			keySize: 2048,
			extensions: [
				{
					name: 'basicConstraints',
					cA: true
				},
				{
					name: 'keyUsage',
					keyCertSign: true,
					digitalSignature: true,
					nonRepudiation: true,
					keyEncipherment: true,
					dataEncipherment: true
				},
				{
					name: 'subjectAltName',
					altNames: [
						{
							type: 2,
							value: 'localhost'
						},
						{
							type: 2,
							value: 'localhost.localdomain'
						},
						{
							type: 2,
							value: 'lvh.me'
						},
						{
							type: 2,
							value: '*.lvh.me'
						},
						{
							type: 2,
							value: '[::1]'
						},
						{
							// type 7 is IP
							type: 7,
							ip: '127.0.0.1'
						},
						{
							type: 7,
							ip: 'fe80::1'
						}
					]
				}
			]
		});
	}

}
