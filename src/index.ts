export function run () {
	// Change the title in the terminal
	process.stdout.write(
		String.fromCharCode(27)
		+ ']0;'
		+ '⚡️ Zap'
		+ String.fromCharCode(7)
	);

	// Do everything else.
	console.log('Hello world!');
}
