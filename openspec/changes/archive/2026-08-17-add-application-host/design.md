## Context

See proposal.md. Modeled on NestJS's `HttpAdapterHost`: `@nestjs/graphql`'s `GraphQLModule` constructor-injects the host and its `onModuleInit` hook mounts the endpoint on the underlying server. In Danet the analogous pieces are token-based value providers (`@Inject('token')`), the `app.router` Hono getter, and the `OnAppBootstrap` hook that `init()` fires after `bootstrap()` completes (`src/app.ts:235-241`). The missing piece is only the registration of the application itself.

## Goals / Non-Goals

**Goals:**

- Any injectable or module hook can obtain the running `DanetApplication` through DI, enabling NestJS-style `forRoot` extension modules.

**Non-Goals:**

- DI into module constructors (modules stay plain `new`; consumers use hooks or injectables).
- Per-app injector containers — the injector remains a process-global singleton.

## Decisions

**1. Register the `DanetApplication` itself under an exported string token (e.g. `APPLICATION_HOST`), not a wrapper class.**
NestJS wraps the adapter in `HttpAdapterHost` because it abstracts Express/Fastify; Danet has exactly one HTTP engine and already exposes it via `app.router`, so the app instance is the useful handle. A wrapper can be introduced later without breaking the token.

**2. Register in the `DanetApplication` constructor (re-asserting on `init()`), using the same value-provider mechanism as `UseValueInjector`.**
Constructor-time registration guarantees availability during module bootstrap (imports are instantiated depth-first inside `init()`), not just in post-bootstrap hooks. Re-asserting on `init()` gives deterministic "most recent app wins" semantics when several apps exist in one process (the test suite does this constantly), which matches how the global injector already behaves for re-bootstrapped injectables.

## Risks / Trade-offs

- [Process-global injector means the token cannot distinguish concurrent apps] → Documented "most recently initialized wins" semantics; Deno tests run sequentially by default, and this matches existing injector behavior. A future per-app container would subsume this.
- [Public API surface grows by one token] → Trivial to maintain; mirrors a well-understood NestJS concept.

## Migration Plan

Additive; ships in a minor `@danet/core` release. No rollback concerns.
