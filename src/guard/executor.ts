import { ForbiddenHttpException } from '../exception/http/forbidden.ts';
import { Injector } from '../injector/injector.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ControllerConstructor } from '../router/controller/constructor.ts';
import { Callback, HttpContext } from '../router/router.ts';
import { Constructor } from '../utils/constructor.ts';
import { GLOBAL_GUARD } from './constants.ts';
import { guardMetadataKey } from './decorator.ts';
import { AuthGuard } from './interface.ts';

export class GuardExecutor {

  constructor(private injector: Injector) {
  }

  async executeAllRelevantGuards(context: HttpContext, Controller: ControllerConstructor, ControllerMethod: Callback) {
    await this.executeGlobalGuard(context);
    await this.executeControllerAndMethodAuthGuards(context, Controller, ControllerMethod);
  }

  async executeGlobalGuard(context: HttpContext) {
    if (this.injector.has(GLOBAL_GUARD)) {
      const globalGuard: AuthGuard = this.injector.get(GLOBAL_GUARD);
      await this.executeGuard(globalGuard, context);
    }
  }

  async executeControllerAndMethodAuthGuards(context: HttpContext, Controller: ControllerConstructor, ControllerMethod: Callback) {
    await this.executeGuardFromMetadata(context, Controller);
    await this.executeGuardFromMetadata(context, ControllerMethod);
  }

  async executeGuard(guard: AuthGuard, context: HttpContext) {
    if (guard) {
      const canActivate = await guard.canActivate(context);
      if (!canActivate) {
        throw new ForbiddenHttpException;
      }
    }
  }

// deno-lint-ignore ban-types
  async executeGuardFromMetadata(context: HttpContext, constructor: Constructor | Function) {
    const guard: AuthGuard = MetadataHelper.getMetadata<AuthGuard>(guardMetadataKey, constructor);
    await this.executeGuard(guard, context);
  }
}
