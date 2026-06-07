# CLAUDE.md

Guidance for working in the Danet codebase.

## What this is

Danet (`@danet/core`) is a NestJS-inspired, decorator-driven backend framework
for **Deno**, built on top of [Hono](https://hono.dev) and published to
[JSR](https://jsr.io/@danet/core). It provides modules, dependency injection,
controllers, guards, exception filters, middleware, lifecycle hooks, events,
scheduling, KV queues, SSE, and view rendering. Deno only — there is no Node
build. Docs: https://danet.land

## Commands

All tooling is Deno-native (no Makefile, no npm).

```bash
# Run the full test suite (with coverage) — matches CI
deno task test

# Run a single test file
deno test -A --unstable-kv --unstable-cron spec/injection.test.ts

# Lint (CI runs this) — only lints src/, excludes *.test.ts
deno lint

# Format — single quotes, tabs (config in deno.json)
deno fmt

# Run the example app in watch mode
deno task start:example
```

The `deno task test` command expands to:
`NO_LOG=true deno test -A --unstable-kv --unstable-cron --coverage=coverage spec/**/*.test.ts`.
The `--unstable-kv` / `--unstable-cron` flags are required (KV queue + schedule
features). `NO_LOG=true` silences framework logging during tests.

CI (`.github/workflows/run-tests.yml`) runs `deno lint` then `deno task test`
against Deno `v1.x` and `canary`. Run both locally before pushing.

## Architecture

Entry point: `mod.ts` → re-exports `src/mod.ts` (the public API barrel).
Main app class: `src/app.ts` (`DanetApplication`).

Source layout under `src/`:

- `injector/` — dependency injection engine (`injector.ts`) and `@Injectable` /
  `@Inject` decorators. Constructor injection via `design:paramtypes` metadata.
- `module/` — `@Module({ controllers, injectables, imports })` + `DynamicModule`.
- `router/controller/` — `@Controller`, HTTP method decorators (`@Get`, `@Post`,
  `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`, `@All`, `@SSE`, `@HttpCode`),
  and param decorators in `params/decorators.ts` (`@Param`, `@Query`, `@Body`,
  `@Req`, `@Res`, `@Header`, `@Session`, `@Context`).
- `router/middleware/` — `@Middleware(...)`; supports Danet middleware classes,
  Hono middleware, and plain functions. Globals in `global-container.ts`.
- `guard/` — `@UseGuard(Guard)` + `AuthGuard.canActivate(context)`.
- `exception/` — HTTP exceptions (`http/`) and `@Catch` filters (`filter/`).
- `hook/` — lifecycle hooks: `OnAppBootstrap`, `OnAppClose`,
  `BeforeControllerMethodIsCalled`.
- `metadata/`, `events/` (`@OnEvent`), `schedule/` (`@Schedule`), `kv-queue/`,
  `sse/`, `renderer/`, `utils/`.

Request flow:
global middleware → route middleware → guards → param resolution →
controller method → response / exception filter.

### Conventions

- Per-folder file naming: `decorator.ts` (decorators), `executor.ts` (run-time
  logic for guards/filters/middleware), `interface.ts`, `constants.ts`,
  `mod.ts` (barrel exports).
- Heavily metadata-driven via `reflect-metadata` (`@dx/reflect`). Decorators
  stash metadata on constructors/methods; executors read it at request time.
- DI scopes: `SCOPE.GLOBAL` (singleton), `SCOPE.REQUEST` (per-request),
  `SCOPE.TRANSIENT` (per-resolution). Request-scoped instances are keyed by
  `ExecutionContext._id`.
- `ExecutionContext` extends Hono's `Context` and adds `_id`, `getHandler()`,
  `getClass()`.
- Token-based injection: `@Inject('token')` with `UseClassInjector` /
  `UseValueInjector`.
- The underlying Hono instance is reachable via `app.router` for advanced cases.
- Decorators require `emitDecoratorMetadata` + `experimentalDecorators` (set in
  `deno.json`). JSX uses Preact (`jsxImportSource: preact`).

## Testing

Tests live in `spec/` as `*.test.ts` (note: `.test.ts`, **not** `.spec.ts`).
Framework is native `Deno.test`; assertions/mocks are imported from
`@std/testing` via the single barrel `src/deps_test.ts` — import test helpers
from there, not directly from JSR.

Standard pattern: build a `@Module`, boot a real app, hit it over HTTP, assert,
clean up.

```typescript
import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get } from '../src/router/controller/decorator.ts';

@Controller('nice-controller')
class SimpleController {
  @Get('/')
  simpleGet() {
    return 'OK GET';
  }
}

@Module({ controllers: [SimpleController] })
class MyModule {}

Deno.test('GET', async () => {
  const app = new DanetApplication();
  await app.init(MyModule);
  const { port } = await app.listen(0); // 0 = random free port

  const res = await fetch(`http://localhost:${port}/nice-controller`);
  assertEquals(await res.text(), 'OK GET');

  await app.close(); // always clean up
});
```

Conventions for new tests:
- Use `app.listen(0)` to get a random port; always `await app.close()`.
- Prefer end-to-end `fetch()` against a booted app over unit-testing internals.
- Use `testContext.step(...)` to group related assertions in one `Deno.test`.
- Access DI instances in tests with `await app.get(SomeClass)`.

## Formatting rules (enforced by `deno fmt`)

Single quotes, tabs for indentation. Run `deno fmt` before committing.

## Contributing

See `CONTRIBUTING.md`. Discuss non-trivial changes via GitHub issues / the
Discord community before large PRs.
