/**
 * @module
 * DanetApplication class where everything begins.
 * @example
 * ```typescript
 * import {
 * 		Controller,
 * 		DanetApplication,
 * 		Get,
 * 		Module,
 * 		Query,
 * 	} from '../src/mod.ts';
 *
 * 	@Controller('')
 * 	class FirstController {
 * 		constructor() {
 * 		}
 *
 * 		@Get('hello-world/:name')
 * 		getHelloWorld(
 * 			@Param('name') name: string,
 * 		) {
 * 			return `Hello World ${name}`;
 * 		}
 * 	}
 *
 * 	@Module({
 * 		controllers: [FirstController]
 * 	})
 * 	class FirstModule {}
 *
 * 	const app = new DanetApplication();
 * 	await app.init(FirstModule);
 *
 * 	let port = Number(Deno.env.get('PORT'));
 * 	if (isNaN(port)) {
 * 		port = 3000;
 * 	}
 * 	app.listen(port);
 * ```
 */

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
import { cors } from './deps.ts';
import { DynamicModule } from './mod.ts';

type CORSOptions = {
	origin: string | string[] | ((origin: string) => string | undefined | null);
	allowMethods?: string[];
	allowHeaders?: string[];
	maxAge?: number;
	credentials?: boolean;
	exposeHeaders?: string[];
};

/**
 * DanetApplication is the main application class for initializing and managing the lifecycle of the application.
 * It provides methods for bootstrapping modules, registering controllers, and configuring middleware.
 * It also provides methods for starting and stopping the application.
 */
export class DanetApplication {
	private app: Application = new Application({ strict: false });
	private internalHttpServer?: Deno.HttpServer;
	private injector = injector;
	private hookExecutor = new HookExecutor(this.injector);
	private renderer = new HandlebarRenderer();
	private guardExecutor = new GuardExecutor(this.injector);
	private filterExecutor = new FilterExecutor(this.injector);
	public httpRouter: DanetHTTPRouter = new DanetHTTPRouter(
		this.injector,
		this.guardExecutor,
		this.filterExecutor,
		this.renderer,
		this.app,
	);
	public websocketRouter: WebSocketRouter = new WebSocketRouter(
		this.injector,
		this.guardExecutor,
		this.filterExecutor,
		this.app,
	);
	private controller: AbortController = new AbortController();
	private logger: Logger = new Logger('DanetApplication');
	public entryModule!: ModuleConstructor;

	/**
	 * Retrieves an instance of the specified type from the injector.
	 *
	 * @template T - The type of the instance to retrieve.
	 * @param {Constructor<T> | string} Type - The constructor of the type or a string identifier.
	 * @returns {T} - The instance of the specified type.
	 */
	get<T>(Type: Constructor<T> | string): T {
		return this.injector.get(Type);
	}

	/**
	 * Bootstraps the application by initializing the provided module and its dependencies.
	 *
	 * @param NormalOrDynamicModule - The module to bootstrap, which can be either a normal constructor or a dynamic module.
	 *
	 * This method performs the following steps:
	 * 1. Determines if the provided module is a normal constructor or a dynamic module.
	 * 2. Initializes the module and retrieves its metadata (controllers, imports, injectables).
	 * 3. Recursively bootstraps all imported modules.
	 * 4. Bootstraps the module using the injector.
	 * 5. Registers controllers with either the HTTP router or WebSocket router based on their metadata.
	 *
	 * @template Constructor - A class constructor type.
	 * @template DynamicModule - A type representing a dynamic module with metadata.
	 * @template ModuleMetadata - A type representing the metadata of a module.
	 */
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

	/**
	 * Initializes the application with the provided module.
	 *
	 * @param Module - The constructor of the module to initialize.
	 * @returns A promise that resolves when the initialization process is complete.
	 */
	async init(Module: Constructor) {
		this.entryModule = Module;
		await this.bootstrap(Module);
		await this.hookExecutor.executeHookForEveryInjectable(
			hookName.APP_BOOTSTRAP,
		);
	}

	/**
	 * Closes the application by executing the necessary hooks and shutting down the internal HTTP server.
	 *
	 * @async
	 * @returns {Promise<void>} A promise that resolves when the application has been closed.
	 */
	async close() {
		await this.hookExecutor.executeHookForEveryInjectable(hookName.APP_CLOSE);
		await this.internalHttpServer?.shutdown();
		this.logger.log('Shutting down');
	}

	/**
	 * Starts the HTTP server and begins listening on the specified port.
	 *
	 * @param {number} [port=3000] - The port number on which the server will listen.
	 * @returns {Promise<{ port: number }>} A promise that resolves with an object containing the port number.
	 *
	 * @remarks
	 * This method initializes an `AbortController` to manage the server's lifecycle and uses Deno's `serve` function to start the server.
	 * The server will log a message indicating the port it is listening on.
	 *
	 * @example
	 * ```typescript
	 * const app = new DanetApplication();
	 * await app.init(FirstModule);
	 * const { port } = app.listen(3000);
	 * ```
	 */
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

	/**
	 * Get hono application instance.
	 *
	 * @returns {Application} The hono instance.
	 */
	get router(): Application {
		return this.app;
	}

	/**
	 * Sets the directory for the view engine.
	 *
	 * @param path - The path to the directory to be set as the root for the view engine.
	 */
	setViewEngineDir(path: string) {
		this.renderer.setRootDir(path);
	}

	/**
	 * Configures the application to serve static assets from the specified path.
	 *
	 * @param path - The file system path from which to serve static assets.
	 */
	useStaticAssets(path: string) {
		this.app.use('*', (context, next: () => Promise<void>) => {
			const root = path;
			return (serveStatic({ root })(context, next));
		});
	}

	/**
	 * Adds one or more global middlewares to the global middleware container.
	 *
	 * @param {...PossibleMiddlewareType[]} middlewares - The middlewares to be added to the global container.
	 */
	addGlobalMiddlewares(...middlewares: PossibleMiddlewareType[]) {
		globalMiddlewareContainer.push(...middlewares);
	}

	/**
	 * Enables Cross-Origin Resource Sharing (CORS) for the application.
	 *
	 * @param {CORSOptions} [options] - Optional configuration for CORS.
	 */
	enableCors(options?: CORSOptions) {
		this.app.use('*', cors(options));
	}

	/**
	 * Registers a hono middleware handler to be used for all routes.
	 *
	 * @param middleware - The middleware handler to be used.
	 */
	use(middleware: MiddlewareHandler) {
		this.app.use('*', middleware);
	}
}
