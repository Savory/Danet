## Why

External packages need a way to reach the running `DanetApplication` (and its underlying Hono router) from inside the module system. NestJS solves this with the injectable `HttpAdapterHost`, which is what lets `GraphQLModule.forRoot(...)` mount its endpoint without the user passing the app around. Danet has no equivalent: modules are constructed with plain `new` and nothing registers the application in the injector, so a `forRoot`-style module cannot mount routes. The first consumer is the planned `@danet/graphql` package (change `add-graphql-support` in the `Danet-graphql` repo), which follows the NestJS GraphQL module design.

## What Changes

- Register the running `DanetApplication` in the injector under a public injection token (an `ApplicationHost`-style value, mirroring NestJS's `HttpAdapterHost`) so any injectable or module lifecycle hook can obtain it via the existing token-based injection mechanism.
- Registration happens early enough that module instances and `OnAppBootstrap` hooks can use it during `init()`.
- Export the token (and any host wrapper type) from the public API barrel.
- Purely additive; no existing behavior changes.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `application-lifecycle`: adds a requirement that the running application is available through dependency injection under a public token (injectable application host), alongside the existing "Underlying Server Access" requirement.

## Impact

- **Code**: `src/app.ts` (register the host during construction/init), a small constants/host file, export from `src/mod.ts`.
- **APIs**: new public injection token; no breaking changes.
- **Consumers**: unblocks NestJS-style `forRoot` modules in external packages (`@danet/graphql` first); documented caveat that the injector is process-global, so the token resolves to the most recently initialized application.
