import {
  Application,
  Router,
} from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { Injector } from './injector/injector.ts';
import { moduleMetadataKey, ModuleOptions } from './module/decorator.ts';
import { DanetRouter } from './router/router.ts';
import { Constructor } from './utils/constructor.ts';


export class DanetApplication {
  private app = new Application();
  private DanetRouter = new DanetRouter();
  private injector = new Injector();

  get<T>(Type: Constructor<T>): T {
    return this.injector.get(Type);
  }

  bootstrap(Module: Constructor) {
    const metadata: ModuleOptions = Reflect.getMetadata(moduleMetadataKey, Module);
    metadata.imports?.forEach((NestedModule) => {
      this.bootstrap(NestedModule);
    })
    this.injector.bootstrap(Module);
    this.registerControllers(metadata.controllers);
  }

  registerControllers(Controllers: Constructor[]) {
    Controllers.forEach((controller) => this.registerController(controller));
  }

  registerController(Controller: Constructor) {
    const basePath = Reflect.getMetadata("endpoint", Controller);
    const methods = Object.getOwnPropertyNames(Controller.prototype);
    methods.forEach((methodName) => {
      this.DanetRouter.createRoute(methodName, Controller, basePath);
    });
  }

  get router(): Router {
    return this.DanetRouter.router;
  }
}

