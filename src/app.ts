import { Application, Router } from 'https://deno.land/x/oak@v10.5.1/mod.ts';
import { HookExecutor } from './hook/executor.ts';
import { hookName } from './hook/interfaces.ts';

import { Injector } from './injector/injector.ts';
import { MetadataHelper } from './metadata/helper.ts';
import { moduleMetadataKey, ModuleOptions } from './module/decorator.ts';
import { DanetRouter } from './router/router.ts';
import { Constructor } from './utils/constructor.ts';

export class DanetApplication {
	private app = new Application();
	private injector = new Injector();
	private hookExecutor = new HookExecutor(this.injector);
	public DanetRouter = new DanetRouter(this.injector);
	private controller: AbortController = new AbortController();

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
			this.registerControllers(metadata.controllers);
		}
		await this.hookExecutor.executeHookForEveryInjectable(
			hookName.APP_BOOTSTRAP,
		);
	}

	async init(Module: Constructor) {
		await this.bootstrap(Module);
		const routes = this.DanetRouter.router.routes();
		this.app.use(routes);
	}

	async close() {
		await this.hookExecutor.executeHookForEveryInjectable(hookName.APP_CLOSE);
		this.controller.abort();
	}

	listen(port = 3000) {
		this.controller = new AbortController();
		const { signal } = this.controller;
		return this.app.listen({ port, signal });
	}

	registerControllers(Controllers: Constructor[]) {
		Controllers.forEach((controller) => this.registerController(controller));
	}

	registerController(Controller: Constructor) {
		const basePath = MetadataHelper.getMetadata<string>('endpoint', Controller);
		const methods = Object.getOwnPropertyNames(Controller.prototype);
		methods.forEach((methodName) => {
			this.DanetRouter.createRoute(methodName, Controller, basePath);
		});
	}
	get router(): Router {
		return this.DanetRouter.router;
	}
}
