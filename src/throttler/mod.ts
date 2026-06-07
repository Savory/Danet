/**
 * Rate limiting for Danet, modeled after `@nestjs/throttler`.
 *
 * https://docs.nestjs.com/security/rate-limiting
 *
 * @module
 */

export { ThrottlerModule } from './module.ts';
export { ThrottlerException, ThrottlerGuard } from './guard.ts';
export { SkipThrottle, Throttle } from './decorator.ts';
export { InMemoryThrottlerStorage } from './storage.ts';
export { THROTTLER_OPTIONS, THROTTLER_STORAGE } from './constants.ts';
export type {
	ThrottleOptions,
	ThrottlerOptions,
	ThrottlerStorage,
	ThrottlerStorageRecord,
} from './interface.ts';
