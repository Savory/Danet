import { Inject } from '../injector/decorator.ts';
import { Injectable } from '../injector/injectable/decorator.ts';
import { MetadataHelper } from '../metadata/helper.ts';
import { ExecutionContext } from '../router/router.ts';
import { AuthGuard } from '../guard/interface.ts';
import { HttpException } from '../exception/http/exceptions.ts';
import { HTTP_STATUS } from '../exception/http/enum.ts';
import { Constructor } from '../utils/constructor.ts';
import {
	DEFAULT_THROTTLER_NAME,
	skipThrottleMetadataKey,
	throttleMetadataKey,
	THROTTLER_OPTIONS,
	THROTTLER_STORAGE,
} from './constants.ts';
import type {
	ThrottleOptions,
	ThrottlerOptions,
	ThrottlerStorage,
} from './interface.ts';

/**
 * Thrown when a caller exceeds the configured rate limit. Serializes to a
 * `429 Too Many Requests` response, mirroring `@nestjs/throttler`.
 */
export class ThrottlerException extends HttpException {
	constructor() {
		super(
			HTTP_STATUS.TOO_MANY_REQUESTS,
			'ThrottlerException: Too Many Requests',
		);
	}
}

/**
 * Guard that enforces the rate limits configured through
 * `ThrottlerModule.forRoot()`. Register it as the global guard (via the
 * `GLOBAL_GUARD` token) or apply it locally with `@UseGuard(ThrottlerGuard)`.
 *
 * https://docs.nestjs.com/security/rate-limiting
 */
@Injectable()
export class ThrottlerGuard implements AuthGuard {
	constructor(
		@Inject(THROTTLER_OPTIONS) private readonly options: ThrottlerOptions[],
		@Inject(THROTTLER_STORAGE) private readonly storage: ThrottlerStorage,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const handler = context.getHandler();
		const classRef = context.getClass();

		if (this.shouldSkip(handler) || this.shouldSkip(classRef)) {
			return true;
		}

		const overrides = this.getOverrides(handler, classRef);
		// When several throttlers are configured (or a single named one), the
		// rate-limit headers are suffixed with the throttler name, matching
		// the behavior of `@nestjs/throttler`.
		const useSuffix = this.options.length > 1 ||
			Boolean(this.options[0]?.name);

		for (const throttler of this.options) {
			const name = throttler.name ?? DEFAULT_THROTTLER_NAME;
			const override = overrides?.[name];
			const limit = override?.limit ?? throttler.limit;
			const ttl = override?.ttl ?? throttler.ttl;

			const key = this.generateKey(context, name);
			const { totalHits, timeToExpire } = await this.storage.increment(
				key,
				ttl,
			);

			const suffix = useSuffix && throttler.name ? `-${throttler.name}` : '';
			const resetSeconds = Math.ceil(timeToExpire / 1000);
			context.header(`X-RateLimit-Limit${suffix}`, String(limit));
			context.header(
				`X-RateLimit-Remaining${suffix}`,
				String(Math.max(0, limit - totalHits)),
			);
			context.header(`X-RateLimit-Reset${suffix}`, String(resetSeconds));

			if (totalHits > limit) {
				context.header(`Retry-After${suffix}`, String(resetSeconds));
				throw new ThrottlerException();
			}
		}

		return true;
	}

	// deno-lint-ignore ban-types
	private shouldSkip(target: Constructor | Function): boolean {
		return MetadataHelper.getMetadata(skipThrottleMetadataKey, target) === true;
	}

	private getOverrides(
		// deno-lint-ignore ban-types
		handler: Function,
		classRef: Constructor,
	): ThrottleOptions | undefined {
		return MetadataHelper.getMetadata<ThrottleOptions>(
			throttleMetadataKey,
			handler,
		) ??
			MetadataHelper.getMetadata<ThrottleOptions>(
				throttleMetadataKey,
				classRef,
			);
	}

	/**
	 * Identifies the caller. Honors common proxy headers before falling back to
	 * the connection's remote address. Override this method to key on something
	 * else (an API key, an authenticated user id, ...).
	 */
	protected getTracker(context: ExecutionContext): string {
		const forwarded = context.req.header('x-forwarded-for');
		if (forwarded) {
			return forwarded.split(',')[0].trim();
		}
		const realIp = context.req.header('x-real-ip');
		if (realIp) {
			return realIp;
		}
		// deno-lint-ignore no-explicit-any
		const remoteAddr = (context.env as any)?.remoteAddr;
		return remoteAddr?.hostname ?? 'global';
	}

	private generateKey(context: ExecutionContext, name: string): string {
		const tracker = this.getTracker(context);
		const className = context.getClass().name;
		const methodName = context.getHandler().name;
		return `${name}-${tracker}-${className}-${methodName}`;
	}
}
