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
}
