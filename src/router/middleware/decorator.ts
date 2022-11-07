import { Constructor } from '../../utils/constructor.ts';
import { ControllerConstructor } from '../controller/constructor.ts';
import { MetadataHelper } from '../../metadata/helper.ts';
import { HttpContext } from '../router.ts';

export interface DanetMiddleware {
  // deno-lint-ignore no-explicit-any
  action(ctx: HttpContext): Promise<any> | any;
}

export const middlewareMetadataKey = 'middlewares';
export const Middleware = (...middlewares: Constructor[]) =>
  (
    // deno-lint-ignore ban-types
    target: ControllerConstructor | Object,
    propertyKey?: string | symbol,
    // deno-lint-ignore no-explicit-any
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (propertyKey && descriptor) {
      MetadataHelper.setMetadata(
        middlewareMetadataKey,
        middlewares,
        descriptor.value,
      );
    } else {
      MetadataHelper.setMetadata(middlewareMetadataKey, middlewares, target);
    }
  };