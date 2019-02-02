export const ZAP =
	' _____             \n' +
	'/__  /  ____ _____ \n' +
	'  / /  / __ `/ __ \\\n' +
	' / /__/ /_/ / /_/ /\n' +
	'/____/\\__,_/ .___/ \n' +
	'          /_/      \n';

export type config = {
	name: string;
	url: string;
	root: string;
	webDir: string;
	assetsDir: string;
	contentDir: string;
	templatesDir: string;
	defaultLayout: string;
	dateFormat: string;
	timeFormat: string;
	[x: string]: any;
};

export const EXTENSIONS = {
	CONTENT: [
		'.md',
		'.markdown',
		'.mdown',
		'.mkdn',
		'.mkd',
		'.mdtxt',
		'.mdtext',
		'.text',
		'.Rmd',
	],

	TEMPLATES: [
		'.twig',
		'.html',
	],
};
