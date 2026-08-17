## 1. Implementation

- [x] 1.1 Add the `APPLICATION_HOST` token constant (new `src/app-host/constants.ts` or existing constants location per conventions)
- [x] 1.2 Register the `DanetApplication` under the token in its constructor and re-assert it at the start of `init()`, via the injector's value-provider mechanism
- [x] 1.3 Export the token from `src/mod.ts`

## 2. Tests (spec/, e2e per project conventions)

- [x] 2.1 An `@Injectable` with `@Inject(APPLICATION_HOST)` receives the running application after `app.init()`
- [x] 2.2 A module's `onAppBootstrap` hook obtains the app via the token, mounts a route on `app.router`, and the route responds after `listen()`
- [x] 2.3 Two sequentially initialized applications: the token resolves to the most recently initialized one

## 3. Finalize

- [x] 3.1 Run `deno lint`, `deno fmt`, `deno task test`; run `graphify update .`
- [x] 3.2 Document the token in the danet.land docs (advanced/extension section) noting the NestJS `HttpAdapterHost` analogy and the most-recent-app caveat
