/**
 * Injection token holding the array of `ThrottlerOptions` provided via
 * `ThrottlerModule.forRoot()`.
 */
export const THROTTLER_OPTIONS = 'THROTTLER_OPTIONS';

/**
 * Injection token holding the `ThrottlerStorage` implementation used to keep
 * track of request counts.
 */
export const THROTTLER_STORAGE = 'THROTTLER_STORAGE';

/**
 * Metadata key set by the `@Throttle()` decorator to override the configured
 * limits for a controller or a route handler.
 */
export const throttleMetadataKey = 'throttler:throttle';

/**
 * Metadata key set by the `@SkipThrottle()` decorator to bypass throttling for
 * a controller or a route handler.
 */
export const skipThrottleMetadataKey = 'throttler:skip';

/**
 * Name used for the throttler when none is provided in its options.
 */
export const DEFAULT_THROTTLER_NAME = 'default';
