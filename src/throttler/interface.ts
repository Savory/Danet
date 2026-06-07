/**
 * Configuration for a single throttler. Multiple throttlers can be configured
 * at once (e.g. a short burst limit and a longer sustained limit).
 *
 * https://docs.nestjs.com/security/rate-limiting
 */
export interface ThrottlerOptions {
	/**
	 * Optional name used to identify the throttler when several are configured.
	 * When omitted, the throttler is named `default`.
	 */
	name?: string;
	/**
	 * The time-to-live of the request window, in milliseconds.
	 */
	ttl: number;
	/**
	 * The maximum number of requests allowed within the `ttl` window.
	 */
	limit: number;
}

/**
 * The result of incrementing the request count for a given key.
 */
export interface ThrottlerStorageRecord {
	/**
	 * The number of requests recorded for the key within the current window.
	 */
	totalHits: number;
	/**
	 * The remaining time before the current window expires, in milliseconds.
	 */
	timeToExpire: number;
}

/**
 * Storage abstraction responsible for tracking request counts per key.
 * Implement this interface to back the throttler with a custom store
 * (Redis, KV, ...). The default implementation keeps counts in memory.
 */
export interface ThrottlerStorage {
	/**
	 * Records a hit for `key` and returns the updated record. Implementations
	 * are responsible for starting a fresh window once the previous one expires.
	 *
	 * @param key - The unique key identifying the caller and route.
	 * @param ttl - The window duration in milliseconds.
	 */
	increment(
		key: string,
		ttl: number,
	): ThrottlerStorageRecord | Promise<ThrottlerStorageRecord>;
}

/**
 * Per-route limit overrides keyed by throttler name, as passed to `@Throttle()`.
 *
 * @example
 * ```ts
 * @Throttle({ default: { ttl: 60000, limit: 3 } })
 * ```
 */
export type ThrottleOptions = Record<string, { ttl: number; limit: number }>;
