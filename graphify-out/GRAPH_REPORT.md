# Graph Report - Danet  (2026-08-16)

## Corpus Check
- 125 files · ~29,593 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 870 nodes · 2346 edges · 48 communities (38 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d6284626`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- router/router.ts
- middleware/executor.ts
- guard.ts
- schedule/module.ts
- src/mod.ts
- Danet (README Overview)
- app.ts
- Renderer
- Module
- Injectable
- controller/decorator.ts
- injection.test.ts
- run.ts
- Get
- SingletonController
- decorators.ts
- Controller
- example/events.ts
- Post
- EventEmitter
- event.ts
- exceptions.ts
- spec/auth-guard.test.ts
- websocket/middleware.test.ts
- imports
- SimpleController
- MisdirectedException
- deno.json
- fmt
- rules
- spec/middleware.test.ts
- lint
- exclude
- websocket/auth-guard.test.ts
- compilerOptions
- exports
- deps_test.ts
- DanetApplication
- DTO
- serve-static.ts
- FirstController
- ExecutionContext
- scoped-lifecycle-hook.test.ts
- mod.ts
- ThrottlerGuard
- NotFoundException
- PreconditionFailedException
- pre-commit

## God Nodes (most connected - your core abstractions)
1. `Module()` - 77 edges
2. `Get` - 74 edges
3. `Controller()` - 58 edges
4. `Injectable()` - 57 edges
5. `DanetApplication` - 49 edges
6. `ExecutionContext` - 44 edges
7. `Constructor` - 42 edges
8. `HttpException` - 35 edges
9. `Injector` - 31 edges
10. `HttpContext` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Community Impact Enforcement Ladder` --semantically_similar_to--> `Type of Change Classification`  [INFERRED] [semantically similar]
  CODE_OF_CONDUCT.md → .github/pull_request_template.md
- `Danet Architecture Philosophy` --semantically_similar_to--> `Metadata-Driven Decorator Architecture`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `AppModule` --references--> `Module()`  [EXTRACTED]
  example/events.ts → src/module/decorator.ts
- `FirstModule` --references--> `Module()`  [EXTRACTED]
  example/run.ts → src/module/decorator.ts
- `AppModule` --references--> `Module()`  [EXTRACTED]
  example/schedule.ts → src/module/decorator.ts

## Import Cycles
- 3-file cycle: `src/mod.ts -> src/module/mod.ts -> src/module/decorator.ts -> src/mod.ts`
- 3-file cycle: `src/router/controller/params/resolver.ts -> src/router/mod.ts -> src/router/router.ts -> src/router/controller/params/resolver.ts`
- 3-file cycle: `src/app.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/injector/injector.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/injector.ts`
- 3-file cycle: `src/mod.ts -> src/schedule/mod.ts -> src/schedule/module.ts -> src/mod.ts`
- 3-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/decorator.ts`
- 3-file cycle: `src/kv-queue/mod.ts -> src/kv-queue/module.ts -> src/mod.ts -> src/kv-queue/mod.ts`
- 3-file cycle: `src/app.ts -> src/module/decorator.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/router/controller/params/decorators.ts -> src/router/router.ts -> src/router/controller/params/resolver.ts -> src/router/controller/params/decorators.ts`
- 3-file cycle: `src/events/events.ts -> src/mod.ts -> src/events/mod.ts -> src/events/events.ts`
- 3-file cycle: `src/kv-queue/kv.ts -> src/mod.ts -> src/kv-queue/mod.ts -> src/kv-queue/kv.ts`
- 3-file cycle: `src/app.ts -> src/router/websocket/router.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/events/mod.ts -> src/events/module.ts -> src/mod.ts -> src/events/mod.ts`
- 4-file cycle: `src/router/controller/mod.ts -> src/router/controller/params/mod.ts -> src/router/controller/params/resolver.ts -> src/router/mod.ts -> src/router/controller/mod.ts`
- 4-file cycle: `src/app.ts -> src/injector/injector.ts -> src/injector/decorator.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/injector.ts -> src/injector/decorator.ts`
- 4-file cycle: `src/app.ts -> src/exception/filter/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/app.ts -> src/guard/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/app.ts -> src/hook/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/guard/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/guard/mod.ts -> src/guard/executor.ts`

## Hyperedges (group relationships)
- **Danet DI Resolution Flow** — claude_module_system, claude_dependency_injection_engine, claude_di_scopes, claude_token_based_injection, claude_execution_context [EXTRACTED 1.00]
- **Danet CI and Release Pipeline** — _github_workflows_run_tests_run_tests_workflow, _github_workflows_run_tests_deno_lint, _github_workflows_run_tests_deno_task_test, _github_workflows_run_tests_codecov_coverage_upload, _github_workflows_main_publish_workflow, _github_workflows_main_jsr_publish [INFERRED 0.85]
- **Danet Contribution Lifecycle** — _github_issue_template_bug_report_bug_report_template, _github_issue_template_feature_request_feature_request_template, _github_pull_request_template_pull_request_checklist, contributing_contribution_workflow, code_of_conduct_contributor_covenant, contributing_discord_community [INFERRED 0.85]

## Communities (48 total, 10 thin omitted)

### Community 0 - "router/router.ts"
Cohesion: 0.07
Nodes (29): TransportRouter, HookExecutor, hookName, getInjectionTokenMetadataKey(), injectionTokenMetadataKey, InjectableConstructor, TokenInjector, UseClassInjector (+21 more)

### Community 1 - "middleware/executor.ts"
Cohesion: 0.14
Nodes (13): FirstGlobalMiddleware, SecondGlobalMiddleware, FirstGlobalMiddleware, SecondGlobalMiddleware, SimpleMiddleware, DanetMiddleware, isMiddlewareClass(), MiddlewareFunction (+5 more)

### Community 2 - "guard.ts"
Cohesion: 0.20
Nodes (12): DEFAULT_THROTTLER_NAME, skipThrottleMetadataKey, throttleMetadataKey, THROTTLER_OPTIONS, THROTTLER_STORAGE, ThrottlerException, ThrottleOptions, ThrottlerOptions (+4 more)

### Community 3 - "schedule/module.ts"
Cohesion: 0.07
Nodes (23): app, AppModule, port, TaskScheduler, TestListener, TestModule, ObjectTicker, QueueListener (+15 more)

### Community 4 - "src/mod.ts"
Cohesion: 0.05
Nodes (19): ControllerWithHook, InjectableWithHook, MyModule, TestController, TestListener, TestModule, eventListenerMetadataKey, Listener (+11 more)

### Community 5 - "Danet (README Overview)"
Cohesion: 0.07
Nodes (41): Bug Report Issue Template, Feature Request Issue Template, Pull Request Checklist, Type of Change Classification, JSR Package Publish (deno publish), OIDC id-token Write Permission, Publish Workflow, Codecov Coverage Upload (+33 more)

### Community 6 - "app.ts"
Cohesion: 0.06
Nodes (27): ControllerWithCustomFilter, ControllerWithFilter, CustomErrorFilter, CustomException, ErrorFilter, ModuleWithFilter, SimpleService, ScopedInjectable (+19 more)

### Community 7 - "Renderer"
Cohesion: 0.16
Nodes (3): defaultOption, HandlebarRenderer, Renderer

### Community 8 - "Module"
Cohesion: 0.19
Nodes (12): MyModule, MyController, MyModule, BothModules, EventsModule, KvModule, ObjectValueModule, PrimitiveValuesModule (+4 more)

### Community 9 - "Injectable"
Cohesion: 0.12
Nodes (8): SharedService, ControllerGuard, GlobalGuard, SimpleService, AddThingToSession, SimpleInjectable, SimpleInjectable, Injectable()

### Community 10 - "controller/decorator.ts"
Cohesion: 0.15
Nodes (12): MyModule, SimpleController, MyModule, All, Delete, Head, HttpCode(), HttpMethod (+4 more)

### Community 11 - "injection.test.ts"
Cohesion: 0.07
Nodes (16): Child1, ConfigurationObject, DatabaseService, FirstModule, GlobalGuard, GlobalInjectable, IDBService, ModuleWithMissingProvider (+8 more)

### Community 12 - "run.ts"
Cohesion: 0.14
Nodes (8): app, FirstController, FirstModule, port, ScopedService1, ScopedService2, Param(), Req

### Community 13 - "Get"
Cohesion: 0.24
Nodes (3): SimpleController, Get, Query()

### Community 15 - "decorators.ts"
Cohesion: 0.13
Nodes (13): MyModule, createMappingDecorator(), argumentResolverFunctionsMetadataKey, BODY_TYPE_KEY, createParamDecorator(), formatQueryValue(), Header(), OptionsResolver (+5 more)

### Community 16 - "Controller"
Cohesion: 0.13
Nodes (13): AppModule, HeadersController, MultiController, OverrideController, ResetController, SkipController, ThrottledController, MyModule (+5 more)

### Community 17 - "example/events.ts"
Cohesion: 0.18
Nodes (8): app, AppModule, port, User, UserListeners, TestListener, EventListener, OnEvent()

### Community 18 - "Post"
Cohesion: 0.25
Nodes (5): App, AppController, jsonWithMessage(), Post, Body()

### Community 19 - "EventEmitter"
Cohesion: 0.19
Nodes (4): UserController, TestController, TestModule, EventEmitter

### Community 21 - "exceptions.ts"
Cohesion: 0.05
Nodes (28): HTTP_STATUS, BadGatewayException, ConflictException, FailedDependencyException, ForbiddenException, GatewayTimeoutException, GoneException, HttpException (+20 more)

### Community 22 - "spec/auth-guard.test.ts"
Cohesion: 0.12
Nodes (15): AuthGuardController, ControllerGuardModule, GlobalAuthController, GlobalAuthModule, MethodGuard, MethodGuardController, MethodGuardModule, ThrowingAuthModule (+7 more)

### Community 23 - "websocket/middleware.test.ts"
Cohesion: 0.20
Nodes (7): ControllerWithCustomFilter, ExampleController, ExampleModule, ControllerWithMiddleware, SimpleController, OnWebSocketMessage(), WebSocketController()

### Community 24 - "imports"
Cohesion: 0.25
Nodes (8): imports, @danet/handlebars, deno_reflect, @hono, @std/fmt, @std/path, @std/testing, validatte

### Community 25 - "SimpleController"
Cohesion: 0.29
Nodes (3): SimpleController, Context(), Res

### Community 27 - "deno.json"
Cohesion: 0.25
Nodes (7): license, name, publish, tasks, start:example, test, version

### Community 28 - "fmt"
Cohesion: 0.50
Nodes (4): fmt, options, singleQuote, useTabs

### Community 29 - "rules"
Cohesion: 0.29
Nodes (7): rules, exclude, include, tags, ban-untagged-todo, no-unused-vars, recommended

### Community 30 - "spec/middleware.test.ts"
Cohesion: 0.15
Nodes (6): ControllerWithMiddleware, SimpleController, SimpleMiddleware, ThrowingMiddleware, BadRequestException, Middleware()

### Community 31 - "lint"
Cohesion: 0.33
Nodes (6): lint, exclude, include, node_modules/, src/, ./**/*.test.ts

### Community 32 - "exclude"
Cohesion: 0.24
Nodes (11): exclude, exclude, ./.claude/, ./coverage/, ./doc/, ./example, .github, ./graphify-out/ (+3 more)

### Community 33 - "websocket/auth-guard.test.ts"
Cohesion: 0.17
Nodes (6): ControllerGuard, ExampleAuthGuard, ExampleController, ExampleModule, ExampleService, ExpectationFailedException

### Community 34 - "compilerOptions"
Cohesion: 0.40
Nodes (5): compilerOptions, emitDecoratorMetadata, experimentalDecorators, jsx, jsxImportSource

### Community 35 - "exports"
Cohesion: 0.40
Nodes (5): exports, ./hook, ./logger, ./metadata, ./validation

### Community 36 - "deps_test.ts"
Cohesion: 0.20
Nodes (5): MyController, MyModule, app, MyController, MyModule

### Community 38 - "DTO"
Cohesion: 0.50
Nodes (4): IsNumber, IsString, LengthGreater, DTO

### Community 39 - "serve-static.ts"
Cohesion: 0.29
Nodes (6): FilePathOptions, getFilePath(), getMimeType(), mimes, serveStatic(), ServeStaticOptions

### Community 42 - "scoped-lifecycle-hook.test.ts"
Cohesion: 0.22
Nodes (4): ParentBeforeScopedModule, ScopedController, ScopedInjectableInterface, SideEffectController

### Community 43 - "mod.ts"
Cohesion: 0.40
Nodes (3): ExampleModule, SSEExampleController, SSE()

## Ambiguous Edges - Review These
- `Deno-Only Runtime Constraint` → `JSR-Only Distribution (@danet/core)`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **65 isolated node(s):** `name`, `version`, `license`, `./metadata`, `./validation` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Deno-Only Runtime Constraint` and `JSR-Only Distribution (@danet/core)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Module()` connect `Module` to `router/router.ts`, `guard.ts`, `schedule/module.ts`, `src/mod.ts`, `app.ts`, `controller/decorator.ts`, `injection.test.ts`, `run.ts`, `decorators.ts`, `Controller`, `example/events.ts`, `Post`, `EventEmitter`, `spec/auth-guard.test.ts`, `websocket/middleware.test.ts`, `spec/middleware.test.ts`, `websocket/auth-guard.test.ts`, `deps_test.ts`, `scoped-lifecycle-hook.test.ts`, `mod.ts`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `Get` connect `Get` to `deps_test.ts`, `src/mod.ts`, `app.ts`, `FirstController`, `Module`, `controller/decorator.ts`, `injection.test.ts`, `run.ts`, `scoped-lifecycle-hook.test.ts`, `SingletonController`, `decorators.ts`, `Controller`, `Post`, `EventEmitter`, `spec/auth-guard.test.ts`, `websocket/middleware.test.ts`, `SimpleController`, `spec/middleware.test.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `Injectable()` connect `Injectable` to `router/router.ts`, `middleware/executor.ts`, `websocket/auth-guard.test.ts`, `guard.ts`, `src/mod.ts`, `app.ts`, `scoped-lifecycle-hook.test.ts`, `injection.test.ts`, `run.ts`, `ThrottlerGuard`, `decorators.ts`, `spec/auth-guard.test.ts`, `websocket/middleware.test.ts`, `spec/middleware.test.ts`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **What connects `name`, `version`, `license` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `router/router.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06543125142987874 - nodes in this community are weakly interconnected._
- **Should `middleware/executor.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13666666666666666 - nodes in this community are weakly interconnected._