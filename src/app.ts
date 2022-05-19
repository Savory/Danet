import {
  Application,
  Router,
} from "https://deno.land/x/oak@v9.0.1/mod.ts";

import { Injector } from './injector/injector.ts';
import { MetadataHelper } from './metadata/helper.ts';
import { moduleMetadataKey, ModuleOptions } from './module/decorator.ts';
import { DanetRouter } from './router/router.ts';
import { Constructor } from './utils/constructor.ts';


export class DanetApplication {
  private app = new Application();
  private injector = new Injector();
  public DanetRouter = new DanetRouter(this.injector);

  get<T>(Type: Constructor<T>| string): T {
    return this.injector.get(Type);
  }

  async bootstrap(Module: Constructor) {
    const metadata: ModuleOptions = MetadataHelper.getMetadata<ModuleOptions>(moduleMetadataKey, Module);
      for (const module in metadata?.imports) {
        // deno-lint-ignore no-explicit-any
        await this.bootstrap(metadata.imports[module as any]);
      }
    await this.injector.bootstrap(Module);
    this.registerControllers(metadata.controllers);
  }

  listen(port = 3000) {
    this.app.use(this.DanetRouter.router.routes());
    return this.app.listen({ port });
  }

  registerControllers(Controllers: Constructor[]) {
    Controllers.forEach((controller) => this.registerController(controller));
  }

  registerController(Controller: Constructor) {
    const basePath = MetadataHelper.getMetadata<string>("endpoint", Controller);
    const methods = Object.getOwnPropertyNames(Controller.prototype);
    methods.forEach((methodName) => {
      this.DanetRouter.createRoute(methodName, Controller, basePath);
    });
  }
  get router(): Router {
    return this.DanetRouter.router;
  }
}

