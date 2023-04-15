import { Application, ApplicationListenEvent, Router } from './deps.ts';
import { FilterExecutor } from './exception/filter/executor.ts';
import { GuardExecutor } from './guard/executor.ts';
import { HookExecutor } from './hook/executor.ts';
import { hookName } from './hook/interfaces.ts';

import { Injector } from './injector/injector.ts';
import { Logger } from './logger.ts';
import { MetadataHelper } from './metadata/helper.ts';
import { moduleMetadataKey, ModuleOptions } from './module/decorator.ts';
import { HandlebarRenderer } from './renderer/handlebar.ts';
import { DanetRouter } from './router/router.ts';
import { Constructor } from './utils/constructor.ts';
import { PossibleMiddlewareType } from './router/middleware/decorator.ts';
import { globalMiddlewareContainer } from './router/middleware/global-container.ts';
import { ModuleConstructor } from './module/constructor.ts';
import { CorsOptions, oakCors } from 'https://deno.land/x/cors/mod.ts';
import {
	ServerContext,
} from 'https://deno.land/x/fresh@1.1.5/src/server/mod.ts';
import {
	collect,
	generate,
} from 'https://deno.land/x/fresh@1.1.5/src/dev/mod.ts';
import {
	dirname,
	fromFileUrl,
} from 'https://deno.land/std@0.178.0/path/mod.ts';

interface ManifestData {
	routes: string[];
	islands: string[];
}

async function generateFreshManifest(url: URL) {
	const fileUrl = fromFileUrl(url);
	const dir = dirname(fileUrl + 'fakefile');
	let currentManifest: ManifestData;
	const prevManifest = Deno.env.get('FRSH_DEV_PREVIOUS_MANIFEST');
	if (prevManifest) {
		currentManifest = JSON.parse(prevManifest);
	} else {
		currentManifest = { islands: [], routes: [] };
	}
	const newManifest = await collect(dir);
	Deno.env.set('FRSH_DEV_PREVIOUS_MANIFEST', JSON.stringify(newManifest));

	const manifestChanged =
		!arraysEqual(newManifest.routes, currentManifest.routes) ||
		!arraysEqual(newManifest.islands, currentManifest.islands);

	if (manifestChanged) await generate(dir, newManifest);
}

export class DanetApplication {
	private app = new Application();
	private injector = new Injector();
	private hookExecutor = new HookExecutor(this.injector);
	private renderer = new HandlebarRenderer();
	public danetRouter = new DanetRouter(
		this.injector,
		new GuardExecutor(this.injector),
		new FilterExecutor(this.injector),
		this.renderer,
	);
	private controller: AbortController = new AbortController();
	private logger: Logger = new Logger('DanetApplication');
	public entryModule!: ModuleConstructor;

	get<T>(Type: Constructor<T> | string): T {
		return this.injector.get(Type);
	}

	async bootstrap(Module: Constructor) {
		const metadata: ModuleOptions = MetadataHelper.getMetadata<ModuleOptions>(
			moduleMetadataKey,
			Module,
		);
		for (const module in metadata?.imports) {
			// deno-lint-ignore no-explicit-any
			await this.bootstrap(metadata.imports[module as any]);
		}
		await this.injector.bootstrap(Module);
		if (metadata.controllers) {
			this.danetRouter.registerControllers(metadata.controllers);
		}
	}

	async init(Module: Constructor) {
		this.entryModule = Module;
		await this.bootstrap(Module);
		await this.hookExecutor.executeHookForEveryInjectable(
			hookName.APP_BOOTSTRAP,
		);
	}

	async close() {
		await this.hookExecutor.executeHookForEveryInjectable(hookName.APP_CLOSE);
		this.controller.abort();
	}

	listen(port = 3000): Promise<ApplicationListenEvent> {
		const routes = this.router.routes();
		this.app.use(routes);
		this.controller = new AbortController();
		const { signal } = this.controller;
		const listen = new Promise<ApplicationListenEvent>((resolve) => {
			this.app.addEventListener('listen', (listen) => {
				this.logger.log(`Listening on ${listen.port}`);
				resolve(listen);
			});
			this.app.listen({ port, signal }).then(() =>
				this.logger.log('Shutting down')
			);
		});
		return listen;
	}

	get router(): Router {
		return this.danetRouter.router;
	}

	setViewEngineDir(path: string) {
		this.renderer.setRootDir(path);
	}

	useStaticAssets(path: string) {
		this.app.use(async (context, next: () => Promise<unknown>) => {
			const root = path;
			try {
				await context.send({ root });
			} catch {
				await next();
			}
		});
	}

	addGlobalMiddlewares(...middlewares: PossibleMiddlewareType[]) {
		globalMiddlewareContainer.push(...middlewares);
	}

	enableCors(options?: CorsOptions) {
		this.app.use(oakCors(options));
	}

	async enableFresh(url: URL, prefix: string) {
		await generateFreshManifest(url);
		const manifest = (await import(url + './fresh.gen.ts')).default;
		const handler = (await ServerContext.fromManifest(manifest, {})).handler();
		this.app.use(async (ctx, next) => {
			if (!ctx.request.url.toString().includes(prefix) && !ctx.request.url.toString().includes('_frsh')) {
				return await next();
			}
			let newUrl = ctx.request.url.toString().replace(prefix, '');
			if (newUrl.endsWith('/')) {
				newUrl = newUrl.slice(0, -1);
			}
			const req = new Request(newUrl, {
				body: ctx.request.originalRequest.getBody().body,
				headers: ctx.request.headers,
				method: ctx.request.method,
			});
			// deno-lint-ignore no-explicit-any
			const res = await handler(req, null as any);
			ctx.response.body = res.body;
			ctx.response.status = res.status;
			ctx.response.headers = res.headers;
		});
	}
}

function arraysEqual<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}
