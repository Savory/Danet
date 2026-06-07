import { MetadataFunction, SetMetadata } from '../metadata/decorator.ts';
import { skipThrottleMetadataKey, throttleMetadataKey } from './constants.ts';
import { ThrottleOptions } from './interface.ts';

/**
 * Overrides the throttling limits for a controller or a route handler.
 *
 * https://docs.nestjs.com/security/rate-limiting#decorators
 *
 * @param options - The per-throttler limit overrides keyed by throttler name.
 * @returns A decorator that stores the override metadata.
 *
 * @example
 * ```ts
 * @Throttle({ default: { ttl: 60000, limit: 3 } })
 * @Get()
 * findAll() {}
 * ```
 */
export function Throttle(options: ThrottleOptions): MetadataFunction {
	return SetMetadata(throttleMetadataKey, options);
}

/**
 * Skips throttling for a controller or a route handler.
 *
 * https://docs.nestjs.com/security/rate-limiting#decorators
 *
 * @param skip - Whether throttling should be skipped (defaults to `true`).
 * @returns A decorator that stores the skip metadata.
 */
export function SkipThrottle(skip = true): MetadataFunction {
	return SetMetadata(skipThrottleMetadataKey, skip);
}
