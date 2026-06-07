import { Module, DynamicModule } from '../module/decorator.ts';
import { THROTTLER_OPTIONS, THROTTLER_STORAGE } from './constants.ts';
import { InMemoryThrottlerStorage } from './storage.ts';
import { ThrottlerOptions, ThrottlerStorage } from './interface.ts';

/**
 * Module exposing the rate-limiting configuration. Import it through
 * `ThrottlerModule.forRoot()` and register `ThrottlerGuard` (globally via the
 * `GLOBAL_GUARD` token, or locally with `@UseGuard(ThrottlerGuard)`).
 *
 * https://docs.nestjs.com/security/rate-limiting
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])],
 *   injectables: [{ useClass: ThrottlerGuard, token: GLOBAL_GUARD }],
 * })
 * class AppModule {}
 * ```
 */
@Module({})
export class ThrottlerModule {
	/**
	 * Configures the throttlers application-wide.
	 *
	 * @param options - One or more throttler configurations. Provide several to
	 * enforce multiple windows at once (e.g. a short and a long limit).
	 * @param storage - Optional custom storage. Defaults to an in-memory store.
	 */
	static forRoot(
		options: ThrottlerOptions[],
		storage?: ThrottlerStorage,
	): DynamicModule {
		return {
			module: ThrottlerModule,
			injectables: [
				{ token: THROTTLER_OPTIONS, useValue: options },
				{
					token: THROTTLER_STORAGE,
					useValue: storage ?? new InMemoryThrottlerStorage(),
				},
			],
		};
	}
}
