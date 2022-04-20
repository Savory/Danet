import {
  Application,
  Router,
} from "https://deno.land/x/oak@v9.0.1/mod.ts";
import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { DeNestRouter } from './router.ts';
import { Constructor } from './utils/constructor.ts';


export class DeNestApplication {
  private app = new Application();
  private deNestRouter = new DeNestRouter();


  registerControllers(Controllers: Constructor[]) {
    Controllers.forEach((controller) => this.registerController(controller));
  }

  registerController(Controller: Constructor) {
    const basePath = Reflect.getMetadata("endpoint", Controller);
    const methods = Object.getOwnPropertyNames(Controller.prototype);
    methods.forEach((methodName) => {
      this.deNestRouter.createRoute(methodName, Controller, basePath);
    });
  }

  get router(): Router {
    return this.deNestRouter.router;
  }
}

