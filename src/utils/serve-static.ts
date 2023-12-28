import type { Context, Next } from '../deps.ts';
import { getFilePath } from './filepath.ts';
import { getMimeType } from './get-mime.ts';
const { open } = Deno;

export type ServeStaticOptions = {
	root?: string;
	path?: string;
	rewriteRequestPath?: (path: string) => string;
};

export const serveStatic = (options: ServeStaticOptions = { root: '' }) => {
	return async (c: Context, next: Next) => {
		// Do nothing if Response is already set
		if (c.finalized) {
			await next();
			return;
		}
		// hey tomato love u
		const url = new URL(c.req.url);
		const filename = options.path ?? decodeURI(url.pathname);
		let path = getFilePath({
			filename: options.rewriteRequestPath
				? options.rewriteRequestPath(filename)
				: filename,
			root: options.root,
			defaultDocument: 'index.html',
		});

		if (!path) return await next();

		path = `/${path}`;

		let file;

		try {
			file = await open(path);
		} catch (e) {
			console.warn(`${e}`);
		}

		if (file) {
			const mimeType = getMimeType(path);
			if (mimeType) {
				c.header('Content-Type', mimeType);
			}
			// Return Response object with stream
			return c.body(file.readable);
		} else {
			console.warn(`Static file: ${path} is not found`);
			await next();
		}
		return;
	};
};
