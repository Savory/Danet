/**
 * @module
 * Public injection token for the running application.
 */

/**
 * Injection token under which the running `DanetApplication` registers itself,
 * Danet's analogue of NestJS's `HttpAdapterHost`. Inject it with
 * `@Inject(APPLICATION_HOST)` or read it from the exported `injector` in a
 * module hook to reach the application and its Hono router (`app.router`).
 * The injector is process-global: the token resolves to the most recently
 * initialized application.
 */
export const APPLICATION_HOST = 'APPLICATION_HOST';
