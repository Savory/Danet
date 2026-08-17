# Graph Report - Danet  (2026-08-17)

## Corpus Check
- 128 files · ~29,899 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 883 nodes · 2379 edges · 69 communities (38 shown, 31 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `63486bda`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.ts
- spec/middleware.test.ts
- guard.ts
- schedule.ts
- OnAppBootstrap
- Danet (README Overview)
- websocket/exception-filter.test.ts
- DanetApplication
- Module
- Injectable
- controller/decorator.ts
- scoped-lifecycle-hook-another-order.test.ts
- run.ts
- src/mod.ts
- schedule/module.ts
- decorators.ts
- Get
- example/events.ts
- Post
- EventEmitter
- event.ts
- HttpException
- spec/auth-guard.test.ts
- websocket/middleware.test.ts
- imports
- KvQueue
- exceptions.ts
- deno.json
- fmt
- rules
- injection.test.ts
- lint
- exclude
- websocket/auth-guard.test.ts
- compilerOptions
- exports
- EventEmitterModule
- Interval
- kv-queue/module.ts
- Logger
- FirstController
- ExecutionContext
- ScheduleModule
- queue.test.ts
- ConflictException
- FailedDependencyException
- ForbiddenException
- GatewayTimeoutException
- GoneException
- HttpVersionNotSupportedException
- LengthRequiredException
- MethodNotAllowedException
- NotAcceptableException
- NotImplementedException
- PreconditionFailedException
- NotValidBodyException
- PayloadTooLargeException
- PaymentRequiredException
- PreconditionRequiredException
- ProxyAuthenticationRequiredException
- RequestedRangeNotSatisfiableException
- ServiceUnavailableException
- TooManyRequestsException
- UnauthorizedException
- pre-commit
- UnprocessableEntityException
- UnsupportedMediaTypeException
- URITooLongException
- .setMetadata

## God Nodes (most connected - your core abstractions)
1. `Module()` - 82 edges
2. `Get` - 74 edges
3. `Injectable()` - 59 edges
4. `Controller()` - 58 edges
5. `DanetApplication` - 53 edges
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
- 3-file cycle: `src/app.ts -> src/router/websocket/router.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/events/events.ts -> src/mod.ts -> src/events/mod.ts -> src/events/events.ts`
- 3-file cycle: `src/events/mod.ts -> src/events/module.ts -> src/mod.ts -> src/events/mod.ts`
- 3-file cycle: `src/kv-queue/kv.ts -> src/mod.ts -> src/kv-queue/mod.ts -> src/kv-queue/kv.ts`
- 3-file cycle: `src/kv-queue/mod.ts -> src/kv-queue/module.ts -> src/mod.ts -> src/kv-queue/mod.ts`
- 3-file cycle: `src/router/controller/params/resolver.ts -> src/router/mod.ts -> src/router/router.ts -> src/router/controller/params/resolver.ts`
- 3-file cycle: `src/router/controller/params/decorators.ts -> src/router/router.ts -> src/router/controller/params/resolver.ts -> src/router/controller/params/decorators.ts`
- 3-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/decorator.ts`
- 3-file cycle: `src/injector/injector.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/injector.ts`
- 3-file cycle: `src/app.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/app.ts -> src/module/decorator.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/mod.ts -> src/schedule/mod.ts -> src/schedule/module.ts -> src/mod.ts`
- 4-file cycle: `src/events/events.ts -> src/mod.ts -> src/events/mod.ts -> src/events/module.ts -> src/events/events.ts`
- 4-file cycle: `src/kv-queue/kv.ts -> src/mod.ts -> src/kv-queue/mod.ts -> src/kv-queue/module.ts -> src/kv-queue/kv.ts`
- 4-file cycle: `src/router/controller/mod.ts -> src/router/controller/params/mod.ts -> src/router/controller/params/resolver.ts -> src/router/mod.ts -> src/router/controller/mod.ts`
- 4-file cycle: `src/app.ts -> src/guard/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/guard/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/guard/mod.ts -> src/guard/executor.ts`
- 4-file cycle: `src/app.ts -> src/injector/injector.ts -> src/injector/decorator.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/injector.ts -> src/injector/decorator.ts`

## Hyperedges (group relationships)
- **Danet DI Resolution Flow** — claude_module_system, claude_dependency_injection_engine, claude_di_scopes, claude_token_based_injection, claude_execution_context [EXTRACTED 1.00]
- **Danet CI and Release Pipeline** — _github_workflows_run_tests_run_tests_workflow, _github_workflows_run_tests_deno_lint, _github_workflows_run_tests_deno_task_test, _github_workflows_run_tests_codecov_coverage_upload, _github_workflows_main_publish_workflow, _github_workflows_main_jsr_publish [INFERRED 0.85]
- **Danet Contribution Lifecycle** — _github_issue_template_bug_report_bug_report_template, _github_issue_template_feature_request_feature_request_template, _github_pull_request_template_pull_request_checklist, contributing_contribution_workflow, code_of_conduct_contributor_covenant, contributing_discord_community [INFERRED 0.85]

## Communities (69 total, 31 thin omitted)

### Community 0 - "app.ts"
Cohesion: 0.06
Nodes (34): CORSOptions, TransportRouter, FilterExecutor, globalExceptionFilterContainer, ExceptionFilter, GuardExecutor, HookExecutor, hookName (+26 more)

### Community 1 - "spec/middleware.test.ts"
Cohesion: 0.12
Nodes (13): ControllerWithMiddleware, FirstGlobalMiddleware, SecondGlobalMiddleware, SimpleController, SimpleMiddleware, ThrowingMiddleware, FirstGlobalMiddleware, SecondGlobalMiddleware (+5 more)

### Community 2 - "guard.ts"
Cohesion: 0.12
Nodes (18): AppModule, OverrideController, SkipController, DEFAULT_THROTTLER_NAME, skipThrottleMetadataKey, throttleMetadataKey, THROTTLER_OPTIONS, THROTTLER_STORAGE (+10 more)

### Community 3 - "schedule.ts"
Cohesion: 0.17
Nodes (10): app, AppModule, port, TaskScheduler, TestListener, TestModule, Cron(), Timeout() (+2 more)

### Community 4 - "OnAppBootstrap"
Cohesion: 0.20
Nodes (4): ControllerWithHook, InjectableWithHook, OnAppBootstrap, OnAppClose

### Community 5 - "Danet (README Overview)"
Cohesion: 0.07
Nodes (41): Bug Report Issue Template, Feature Request Issue Template, Pull Request Checklist, Type of Change Classification, JSR Package Publish (deno publish), OIDC id-token Write Permission, Publish Workflow, Codecov Coverage Upload (+33 more)

### Community 6 - "websocket/exception-filter.test.ts"
Cohesion: 0.06
Nodes (18): ControllerWithCustomFilter, ControllerWithFilter, CustomErrorFilter, CustomException, ErrorFilter, ModuleWithFilter, SimpleService, ControllerWithCustomFilter (+10 more)

### Community 7 - "DanetApplication"
Cohesion: 0.06
Nodes (14): HostConsumer, MyModule, SimpleController, DanetApplication, Render(), defaultOption, HandlebarRenderer, Renderer (+6 more)

### Community 8 - "Module"
Cohesion: 0.14
Nodes (17): ConsumerModule, FirstEmptyModule, RouteMountingModule, SecondEmptyModule, MyModule, MyModule, BothModules, EventsModule (+9 more)

### Community 9 - "Injectable"
Cohesion: 0.09
Nodes (13): SharedService, ControllerGuard, GlobalGuard, MethodGuard, SimpleService, ThrowingGuard, GlobalGuard, AddThingToSession (+5 more)

### Community 10 - "controller/decorator.ts"
Cohesion: 0.14
Nodes (13): MyModule, SimpleController, MyModule, All, Delete, Head, HttpCode(), HttpMethod (+5 more)

### Community 11 - "scoped-lifecycle-hook-another-order.test.ts"
Cohesion: 0.06
Nodes (21): Child1, MyModule, InjectableUsingScoped, ParentAfterScopedModule, ScopedController, ScopedInjectable, ScopedInjectableInterface, SideEffectController (+13 more)

### Community 12 - "run.ts"
Cohesion: 0.13
Nodes (7): app, FirstController, FirstModule, port, ScopedService1, ScopedService2, Req

### Community 13 - "src/mod.ts"
Cohesion: 0.23
Nodes (3): APPLICATION_HOST, eventListenerMetadataKey, Listener

### Community 14 - "schedule/module.ts"
Cohesion: 0.35
Nodes (7): intervalMetadataKey, scheduleMetadataKey, timeoutMetadataKey, CronMetadataPayload, CronString, IntervalMetadataPayload, TimeoutMetadataPayload

### Community 15 - "decorators.ts"
Cohesion: 0.11
Nodes (16): MyModule, SimpleController, argumentResolverFunctionsMetadataKey, BODY_TYPE_KEY, Context(), createParamDecorator(), formatQueryValue(), Header() (+8 more)

### Community 16 - "Get"
Cohesion: 0.08
Nodes (16): GlobalAuthController, MyController, app, MyController, MyModule, SingletonController, HeadersController, MultiController (+8 more)

### Community 17 - "example/events.ts"
Cohesion: 0.15
Nodes (9): app, AppModule, port, User, UserListeners, TestListener, TestModule, EventListener (+1 more)

### Community 18 - "Post"
Cohesion: 0.16
Nodes (9): IsNumber, IsString, LengthGreater, App, AppController, DTO, jsonWithMessage(), Post (+1 more)

### Community 19 - "EventEmitter"
Cohesion: 0.21
Nodes (3): UserController, TestController, EventEmitter

### Community 21 - "HttpException"
Cohesion: 0.20
Nodes (5): BadGatewayException, HttpException, IAmATeapotException, InternalServerErrorException, NotFoundException

### Community 22 - "spec/auth-guard.test.ts"
Cohesion: 0.17
Nodes (12): AuthGuardController, ControllerGuardModule, GlobalAuthModule, MethodGuardController, MethodGuardModule, ThrowingAuthModule, ThrowingGuardController, GLOBAL_GUARD (+4 more)

### Community 23 - "websocket/middleware.test.ts"
Cohesion: 0.18
Nodes (7): ExampleController, ControllerWithMiddleware, SimpleController, SimpleInjectable, BadRequestException, OnWebSocketMessage(), WebSocketController()

### Community 24 - "imports"
Cohesion: 0.25
Nodes (8): imports, @danet/handlebars, deno_reflect, @hono, @std/fmt, @std/path, @std/testing, validatte

### Community 26 - "exceptions.ts"
Cohesion: 0.32
Nodes (3): HTTP_STATUS, MisdirectedException, RequestTimeoutException

### Community 27 - "deno.json"
Cohesion: 0.25
Nodes (7): license, name, publish, tasks, start:example, test, version

### Community 28 - "fmt"
Cohesion: 0.50
Nodes (4): fmt, options, singleQuote, useTabs

### Community 29 - "rules"
Cohesion: 0.29
Nodes (7): rules, exclude, include, tags, ban-untagged-todo, no-unused-vars, recommended

### Community 30 - "injection.test.ts"
Cohesion: 0.22
Nodes (7): ConfigurationObject, DatabaseService, FirstModule, GlobalInjectable, IDBService, ModuleWithMissingProvider, SecondModule

### Community 31 - "lint"
Cohesion: 0.33
Nodes (6): lint, exclude, include, node_modules/, src/, ./**/*.test.ts

### Community 32 - "exclude"
Cohesion: 0.24
Nodes (11): exclude, exclude, ./.claude/, ./coverage/, ./doc/, ./example, .github, ./graphify-out/ (+3 more)

### Community 33 - "websocket/auth-guard.test.ts"
Cohesion: 0.29
Nodes (3): ExampleController, ExampleService, ExpectationFailedException

### Community 34 - "compilerOptions"
Cohesion: 0.40
Nodes (5): compilerOptions, emitDecoratorMetadata, experimentalDecorators, jsx, jsxImportSource

### Community 35 - "exports"
Cohesion: 0.40
Nodes (5): exports, ./hook, ./logger, ./metadata, ./validation

### Community 37 - "Interval"
Cohesion: 0.22
Nodes (5): ObjectTicker, QueueListener, QueueTicker, Ticker, Interval()

### Community 38 - "kv-queue/module.ts"
Cohesion: 0.44
Nodes (4): KV_QUEUE_NAME, QueueEvent, queueListenerMetadataKey, Listener

### Community 43 - "queue.test.ts"
Cohesion: 0.38
Nodes (3): TestListener, TestModule, OnQueueMessage()

### Community 68 - ".setMetadata"
Cohesion: 0.33
Nodes (4): ExampleModule, SSEExampleController, createMappingDecorator(), SSE()

## Ambiguous Edges - Review These
- `Deno-Only Runtime Constraint` → `JSR-Only Distribution (@danet/core)`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **65 isolated node(s):** `name`, `version`, `license`, `./metadata`, `./validation` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Deno-Only Runtime Constraint` and `JSR-Only Distribution (@danet/core)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Module()` connect `Module` to `app.ts`, `spec/middleware.test.ts`, `guard.ts`, `schedule.ts`, `websocket/exception-filter.test.ts`, `DanetApplication`, `controller/decorator.ts`, `scoped-lifecycle-hook-another-order.test.ts`, `run.ts`, `src/mod.ts`, `schedule/module.ts`, `decorators.ts`, `Get`, `example/events.ts`, `Post`, `spec/auth-guard.test.ts`, `websocket/middleware.test.ts`, `injection.test.ts`, `websocket/auth-guard.test.ts`, `EventEmitterModule`, `kv-queue/module.ts`, `ScheduleModule`, `queue.test.ts`, `.setMetadata`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `Get` connect `Get` to `spec/middleware.test.ts`, `guard.ts`, `websocket/exception-filter.test.ts`, `DanetApplication`, `Module`, `FirstController`, `controller/decorator.ts`, `queue.test.ts`, `run.ts`, `scoped-lifecycle-hook-another-order.test.ts`, `decorators.ts`, `example/events.ts`, `Post`, `EventEmitter`, `spec/auth-guard.test.ts`, `websocket/middleware.test.ts`, `KvQueue`, `injection.test.ts`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `Injectable()` connect `Injectable` to `app.ts`, `spec/middleware.test.ts`, `websocket/auth-guard.test.ts`, `guard.ts`, `OnAppBootstrap`, `websocket/exception-filter.test.ts`, `DanetApplication`, `Module`, `ExecutionContext`, `kv-queue/module.ts`, `scoped-lifecycle-hook-another-order.test.ts`, `run.ts`, `Logger`, `decorators.ts`, `spec/auth-guard.test.ts`, `websocket/middleware.test.ts`, `KvQueue`, `injection.test.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `name`, `version`, `license` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06415929203539823 - nodes in this community are weakly interconnected._
- **Should `spec/middleware.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1168091168091168 - nodes in this community are weakly interconnected._