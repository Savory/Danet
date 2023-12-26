import { Application, MiddlewareHandler } from './deps.ts';
import { FilterExecutor } from './exception/filter/executor.ts';
import { GuardExecutor } from './guard/executor.ts';
import { HookExecutor } from './hook/executor.ts';
import { hookName } from './hook/interfaces.ts';

import { Injector } from './injector/injector.ts';
import { Logger } from './logger.ts';
import { MetadataHelper } from './metadata/helper.ts';
import { moduleMetadataKey, ModuleOptions } from './module/decorator.ts';
import { HandlebarRenderer } from './renderer/handlebar.ts';
import { DanetRouter, HttpContext } from './router/router.ts';
import { Constructor } from './utils/constructor.ts';
import { PossibleMiddlewareType } from './router/middleware/decorator.ts';
import { globalMiddlewareContainer } from './router/middleware/global-container.ts';
import { ModuleConstructor } from './module/constructor.ts';
import { serveStatic } from './utils/serve-static.ts';
import { cors } from 'https://deno.land/x/hono/middleware.ts'

type CORSOptions = {
	origin: string | string[] | ((origin: string) => string | undefined | null)
	allowMethods?: string[]
	allowHeaders?: string[]
	maxAge?: number
	credentials?: boolean
	exposeHeaders?: string[]
  }

export class DanetApplication {
	private app: Application = new Application({ strict: false });
	private internalHttpServer?: Deno.HttpServer;
	private injector = new Injector();
	private hookExecutor = new HookExecutor(this.injector);
	private renderer = new HandlebarRenderer();
	public danetRouter = new DanetRouter(
		this.injector,
		new GuardExecutor(this.injector),
		new FilterExecutor(this.injector),
		this.renderer,
		this.app,
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
		await this.internalHttpServer?.shutdown();
		this.logger.log('Shutting down');
	}

	listen(port = 3000): Promise<{ port: number }> {
		this.controller = new AbortController();
		const { signal } = this.controller;
		const listen = new Promise<{ port: number }>((resolve) => {
			this.internalHttpServer = Deno.serve({ signal, port, onListen: (listen) => {
				this.logger.log(`Listening on ${listen.port}`);
				resolve({ ...listen });
			} }, this.app.fetch);
		});
		return listen;
	}

	get router(): Application {
		return this.app;
	}

	setViewEngineDir(path: string) {
		this.renderer.setRootDir(path);
	}

	useStaticAssets(path: string) {
		console.log(path);
		this.app.use('*', async (context, next: () => Promise<void>) => {
			const root = path;
			return (serveStatic({root})(context, next));
		});
	}

	addGlobalMiddlewares(...middlewares: PossibleMiddlewareType[]) {
		globalMiddlewareContainer.push(...middlewares);
	}

	enableCors(options?: CORSOptions) {
		this.app.use(cors(options));
	}

	use(middleware: MiddlewareHandler) {
		this.app.use(middleware);
	}
}
