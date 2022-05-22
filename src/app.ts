import { ApplicationListenEvent } from 'https://deno.land/x/oak@v10.5.1/application.ts';
import { Application, Router } from 'https://deno.land/x/oak@v10.5.1/mod.ts';
import { HookExecutor } from './hook/executor.ts';
import { hookName } from './hook/interfaces.ts';

import { Injector } from './injector/injector.ts';
import { Logger } from './logger.ts';
import { MetadataHelper } from './metadata/helper.ts';
import { moduleMetadataKey, ModuleOptions } from './module/decorator.ts';
import { DanetRouter } from './router/router.ts';
import { Constructor } from './utils/constructor.ts';

export class DanetApplication {
	private app = new Application();
	private injector = new Injector();
	private hookExecutor = new HookExecutor(this.injector);
	public danetRouter = new DanetRouter(this.injector);
	private controller: AbortController = new AbortController();
	private logger: Logger = new Logger('DanetApplication');

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
		await this.hookExecutor.executeHookForEveryInjectable(
			hookName.APP_BOOTSTRAP,
		);
	}

	async init(Module: Constructor) {
		await this.bootstrap(Module);
		const routes = this.router.routes();
		this.app.use(routes);
	}

	async close() {
		await this.hookExecutor.executeHookForEveryInjectable(hookName.APP_CLOSE);
		this.controller.abort();
	}

	listen(port = 3000): Promise<ApplicationListenEvent> {
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
}
