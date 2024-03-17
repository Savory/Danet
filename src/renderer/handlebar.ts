import { Renderer } from './interface.ts';
import { Handlebars } from 'https://deno.land/x/handlebars@v0.10.0/mod.ts';

const defaultOption = {
	baseDir: 'views',
	extname: '.hbs',
	layoutsDir: 'layouts/',
	partialsDir: 'partials/',
	cachePartials: true,
	defaultLayout: 'main',
	helpers: undefined,
	compilerOptions: undefined,
};

export class HandlebarRenderer implements Renderer {
	private hbs: Handlebars;

	constructor() {
		this.hbs = new Handlebars(defaultOption);
	}

	setRootDir(rootDirectory: string) {
		this.hbs = new Handlebars({
			...defaultOption,
			baseDir: rootDirectory,
		});
	}

	render(filename: string, data: Record<string, unknown>): Promise<string> {
		return this.hbs.renderView(filename, data);
	}
}
