import { AuthGuard } from '../guard/interface.ts';
import { ExecutionContext } from '../router/router.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { throttleMetadataKey, ThrottleOptions } from './decorator.ts';
import { ThrottlerService } from './service.ts';
import { Injectable } from '../injector/injectable/decorator.ts';
import { TooManyRequestsException } from '../exception/http/exceptions.ts';

/**
 * A guard that checks throttle metadata (method/controller) and enforces limits.
 */
@Injectable()
export class ThrottleGuard implements AuthGuard {
  constructor(private throttler: ThrottlerService) {}

canActivate(context: ExecutionContext) {
    const handler = context.getHandler();
    const controller = context.getClass();

    const methodOptions = MetadataHelper.getMetadata<ThrottleOptions>(
      throttleMetadataKey,
      handler,
    );
    const controllerOptions = MetadataHelper.getMetadata<ThrottleOptions>(
      throttleMetadataKey,
      controller,
    );
    const options = methodOptions || controllerOptions;
    if (!options) {
      // nothing to do
      return true;
    }

    // default key: X-Forwarded-For header, fallbacks to remote address or global
    const ip = context.req.headers.get('x-forwarded-for') || context.req.headers.get('x-real-ip') || 'global';
    const key = `${context.get('_id') || ''}:${ip}:${context.getHandler().name}`;

    const count = this.throttler.consume(key, options.ttl || 60);
    if (count > options.limit) {
      throw new TooManyRequestsException();
    }
    return true;
  }
}
