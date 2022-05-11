import { Reflect } from 'https://deno.land/x/reflect_metadata@v0.1.12-2/Reflect.ts';
import { ForbiddenHttpException } from '../exception/http/Forbidden.ts';
import { HttpContext } from '../router/router.ts';
import { Constructor } from '../utils/constructor.ts';
import { guardMetadataKey } from './decorator.ts';
import { AuthGuard } from './interface.ts';

export class GuardExecutor {

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
    const guard: AuthGuard = Reflect.getMetadata(guardMetadataKey, constructor);
    await this.executeGuard(guard, context);
  }
}
