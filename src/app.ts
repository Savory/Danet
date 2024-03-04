import { Application, MiddlewareHandler } from './deps.ts';
import { FilterExecutor } from './exception/filter/executor.ts';
import { GuardExecutor } from './guard/executor.ts';
import { HookExecutor } from './hook/executor.ts';
import { hookName } from './hook/interfaces.ts';

import { injector } from './injector/injector.ts';
import { Logger } from './logger.ts';
import { MetadataHelper } from './metadata/helper.ts';
import { ModuleMetadata, moduleMetadataKey } from './module/decorator.ts';
import { HandlebarRenderer } from './renderer/handlebar.ts';
import { DanetHTTPRouter } from './router/router.ts';
import { WebSocketRouter } from './router/websocket/router.ts';
import { Constructor } from './utils/constructor.ts';
import { PossibleMiddlewareType } from './router/middleware/decorator.ts';
import { globalMiddlewareContainer } from './router/middleware/global-container.ts';
import { ModuleConstructor } from './module/constructor.ts';
import { serveStatic } from './utils/serve-static.ts';
import { cors } from 'https://deno.land/x/hono/middleware.ts';
import { DynamicModule } from './mod.ts';

type CORSOptions = {
	origin: string | string[] | ((origin: string) => string | undefined | null);
	allowMethods?: string[];
	allowHeaders?: string[];
	maxAge?: number;
	credentials?: boolean;
	exposeHeaders?: string[];
};

export class DanetApplication {
	private app: Application = new Application({ strict: false });
	private internalHttpServer?: Deno.HttpServer;
	private injector = injector;
	private hookExecutor = new HookExecutor(this.injector);
	private renderer = new HandlebarRenderer();
	private guardExecutor = new GuardExecutor(this.injector);
	private filterExecutor = new FilterExecutor(this.injector);
	public httpRouter = new DanetHTTPRouter(
		this.injector,
		this.guardExecutor,
		this.filterExecutor,
		this.renderer,
		this.app,
	);
	public websocketRouter = new WebSocketRouter(
		this.injector,
		this.guardExecutor,
		this.filterExecutor,
		this.app,
	);
	private controller: AbortController = new AbortController();
	private logger: Logger = new Logger('DanetApplication');
	public entryModule!: ModuleConstructor;

	get<T>(Type: Constructor<T> | string): T {
		return this.injector.get(Type);
	}

	async bootstrap(NormalOrDynamicModule: Constructor | DynamicModule) {
		// deno-lint-ignore no-explicit-any
		const possibleModuleInstance = NormalOrDynamicModule as any;
		let instance: ModuleMetadata;

		if (
			!possibleModuleInstance.module
		) {
			instance = new (NormalOrDynamicModule as Constructor)() as DynamicModule;
			const metadata: ModuleMetadata = MetadataHelper.getMetadata<
				ModuleMetadata
			>(
				moduleMetadataKey,
				NormalOrDynamicModule,
			);
			instance.controllers = metadata.controllers;
			instance.imports = metadata.imports;
			instance.injectables = metadata.injectables;
		} else {
			instance = new ((NormalOrDynamicModule as DynamicModule)
				.module)() as ModuleMetadata;
			instance.controllers =
				(NormalOrDynamicModule as DynamicModule).controllers;
			instance.imports = (NormalOrDynamicModule as DynamicModule).imports;
			instance.injectables =
				(NormalOrDynamicModule as DynamicModule).injectables;
		}

		for (const module in instance?.imports) {
			// deno-lint-ignore no-explicit-any
			await this.bootstrap(instance.imports[module as any]);
		}

		await this.injector.bootstrapModule(instance);

		if (instance.controllers) {
			instance.controllers.forEach((Controller) => {
				const httpEndpoint = MetadataHelper.getMetadata<string>(
					'endpoint',
					Controller,
				);
				const webSocketEndpoint = MetadataHelper.getMetadata<string>(
					'websocket-endpoint',
					Controller,
				);
				if (webSocketEndpoint) {
					this.websocketRouter.registerController(
						Controller,
						webSocketEndpoint,
					);
				} else {
					this.httpRouter.registerController(Controller, httpEndpoint);
				}
			});
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
			this.internalHttpServer = Deno.serve({
				signal,
				port,
				onListen: (listen) => {
					this.logger.log(`Listening on ${listen.port}`);
					resolve({ ...listen });
				},
			}, this.app.fetch);
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
		this.app.use('*', (context, next: () => Promise<void>) => {
			const root = path;
			return (serveStatic({ root })(context, next));
		});
	}

	addGlobalMiddlewares(...middlewares: PossibleMiddlewareType[]) {
		globalMiddlewareContainer.push(...middlewares);
	}

	enableCors(options?: CORSOptions) {
		this.app.use('*', cors(options));
	}

	use(middleware: MiddlewareHandler) {
		this.app.use('*', middleware);
	}
}
