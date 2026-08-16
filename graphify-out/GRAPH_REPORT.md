# Graph Report - Danet  (2026-08-16)

## Corpus Check
- Corpus is ~29,058 words - fits in a single context window. You may not need a graph.

## Summary
- 857 nodes · 2319 edges · 65 communities (36 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Application Core and Transport Router
- Middleware and WebSocket Tests
- Rate Limiting and Throttling
- Scheduled Tasks
- Lifecycle Hooks and KV Queue Tests
- Issue Templates and CI Workflows
- Exception Filter Tests
- View Rendering and Application API
- Test Module Definitions
- Guard Implementations
- HTTP Method Decorators
- Injection and Scoped Provider Tests
- Example Application Controllers
- Param Decorator Controllers
- Injection Test Providers
- Param Decorator Internals
- Scoped Lifecycle Hook Ordering
- Event Emitter Example
- Body Validation Controllers
- Event Emitter Runtime
- Server-Sent Events
- HTTP Exception Class Family
- Guard Decorators and Controllers
- Logger
- Dependency Import Map
- Context and Response Decorators
- HTTP Status Enum and Exceptions
- Deno Tasks and Package Metadata
- Formatter Configuration
- Lint Rule Configuration
- Event Metadata and Module
- Lint Include and Exclude Paths
- Publish Exclusion Paths
- Injectable Decorator and Scopes
- TypeScript Compiler Options
- Package Export Map
- CORS Tests
- Event Emitter Module Registration
- Validation DTO Fixtures
- Base Path Tests
- Request Scoped Injection Test
- Conflict Exception
- Failed Dependency Exception
- Forbidden Exception
- Gateway Timeout Exception
- Gone Exception
- HTTP Version Not Supported Exception
- Length Required Exception
- Method Not Allowed Exception
- Not Acceptable Exception
- Not Implemented Exception
- Not Valid Body Exception
- Payload Too Large Exception
- Payment Required Exception
- Precondition Failed Exception
- Precondition Required Exception
- Proxy Authentication Required Exception
- Requested Range Not Satisfiable Exception
- Service Unavailable Exception
- Too Many Requests Exception
- Unauthorized Exception
- Unprocessable Entity Exception
- Unsupported Media Type Exception
- URI Too Long Exception
- Pre-commit Git Hook

## God Nodes (most connected - your core abstractions)
1. `Get` - 74 edges
2. `Module()` - 73 edges
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
- 3-file cycle: `src/kv-queue/kv.ts -> src/mod.ts -> src/kv-queue/mod.ts -> src/kv-queue/kv.ts`
- 3-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/decorator.ts`
- 3-file cycle: `src/router/controller/params/decorators.ts -> src/router/router.ts -> src/router/controller/params/resolver.ts -> src/router/controller/params/decorators.ts`
- 3-file cycle: `src/router/controller/params/resolver.ts -> src/router/mod.ts -> src/router/router.ts -> src/router/controller/params/resolver.ts`
- 3-file cycle: `src/kv-queue/mod.ts -> src/kv-queue/module.ts -> src/mod.ts -> src/kv-queue/mod.ts`
- 3-file cycle: `src/app.ts -> src/module/decorator.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/mod.ts -> src/module/mod.ts -> src/module/decorator.ts -> src/mod.ts`
- 3-file cycle: `src/app.ts -> src/router/websocket/router.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/events/events.ts -> src/mod.ts -> src/events/mod.ts -> src/events/events.ts`
- 3-file cycle: `src/events/mod.ts -> src/events/module.ts -> src/mod.ts -> src/events/mod.ts`
- 3-file cycle: `src/app.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`
- 3-file cycle: `src/injector/injector.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/injector.ts`
- 3-file cycle: `src/mod.ts -> src/schedule/mod.ts -> src/schedule/module.ts -> src/mod.ts`
- 4-file cycle: `src/kv-queue/kv.ts -> src/mod.ts -> src/kv-queue/mod.ts -> src/kv-queue/module.ts -> src/kv-queue/kv.ts`
- 4-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/throttler/mod.ts -> src/throttler/guard.ts -> src/injector/decorator.ts`
- 4-file cycle: `src/mod.ts -> src/throttler/mod.ts -> src/throttler/module.ts -> src/module/decorator.ts -> src/mod.ts`
- 4-file cycle: `src/app.ts -> src/injector/injector.ts -> src/injector/decorator.ts -> src/mod.ts -> src/app.ts`
- 4-file cycle: `src/injector/decorator.ts -> src/mod.ts -> src/injector/mod.ts -> src/injector/injector.ts -> src/injector/decorator.ts`
- 4-file cycle: `src/events/events.ts -> src/mod.ts -> src/events/mod.ts -> src/events/module.ts -> src/events/events.ts`
- 4-file cycle: `src/app.ts -> src/exception/filter/executor.ts -> src/injector/injector.ts -> src/mod.ts -> src/app.ts`

## Hyperedges (group relationships)
- **Danet CI and Release Pipeline** — _github_workflows_run_tests_run_tests_workflow, _github_workflows_run_tests_deno_lint, _github_workflows_run_tests_deno_task_test, _github_workflows_run_tests_codecov_coverage_upload, _github_workflows_main_publish_workflow, _github_workflows_main_jsr_publish [INFERRED 0.85]
- **Danet DI Resolution Flow** — claude_module_system, claude_dependency_injection_engine, claude_di_scopes, claude_token_based_injection, claude_execution_context [EXTRACTED 1.00]
- **Danet Contribution Lifecycle** — _github_issue_template_bug_report_bug_report_template, _github_issue_template_feature_request_feature_request_template, _github_pull_request_template_pull_request_checklist, contributing_contribution_workflow, code_of_conduct_contributor_covenant, contributing_discord_community [INFERRED 0.85]

## Communities (65 total, 29 thin omitted)

### Community 0 - "Application Core and Transport Router"
Cohesion: 0.06
Nodes (27): CORSOptions, TransportRouter, FilterExecutor, globalExceptionFilterContainer, GuardExecutor, HookExecutor, hookName, UseClassInjector (+19 more)

### Community 1 - "Middleware and WebSocket Tests"
Cohesion: 0.05
Nodes (34): ControllerWithMiddleware, FirstGlobalMiddleware, SecondGlobalMiddleware, SimpleController, SimpleInjectable, SimpleMiddleware, ThrowingMiddleware, ExampleController (+26 more)

### Community 2 - "Rate Limiting and Throttling"
Cohesion: 0.09
Nodes (22): HeadersController, MultiController, OverrideController, ResetController, SkipController, ThrottledController, OnAppClose, DEFAULT_THROTTLER_NAME (+14 more)

### Community 3 - "Scheduled Tasks"
Cohesion: 0.09
Nodes (22): app, AppModule, port, TaskScheduler, TestListener, TestModule, QueueTicker, Ticker (+14 more)

### Community 4 - "Lifecycle Hooks and KV Queue Tests"
Cohesion: 0.06
Nodes (15): ControllerWithHook, InjectableWithHook, MyModule, TestController, TestListener, TestModule, OnAppBootstrap, TokenInjector (+7 more)

### Community 5 - "Issue Templates and CI Workflows"
Cohesion: 0.07
Nodes (41): Bug Report Issue Template, Feature Request Issue Template, Pull Request Checklist, Type of Change Classification, JSR Package Publish (deno publish), OIDC id-token Write Permission, Publish Workflow, Codecov Coverage Upload (+33 more)

### Community 6 - "Exception Filter Tests"
Cohesion: 0.07
Nodes (16): ControllerWithCustomFilter, ControllerWithFilter, CustomErrorFilter, CustomException, ErrorFilter, ModuleWithFilter, SimpleService, CustomErrorFilter (+8 more)

### Community 7 - "View Rendering and Application API"
Cohesion: 0.07
Nodes (13): MyModule, SimpleController, DanetApplication, Render(), defaultOption, HandlebarRenderer, Renderer, FilePathOptions (+5 more)

### Community 8 - "Test Module Definitions"
Cohesion: 0.09
Nodes (20): ControllerGuardModule, GlobalAuthModule, MethodGuardModule, ThrowingAuthModule, FirstModule, ModuleWithMissingProvider, SecondModule, MyModule (+12 more)

### Community 9 - "Guard Implementations"
Cohesion: 0.12
Nodes (11): ControllerGuard, GlobalGuard, MethodGuard, SimpleService, ThrowingGuard, GlobalGuard, AddThingToSession, ControllerGuard (+3 more)

### Community 10 - "HTTP Method Decorators"
Cohesion: 0.15
Nodes (12): MyModule, SimpleController, MyModule, All, Delete, Head, HttpCode(), HttpMethod (+4 more)

### Community 11 - "Injection and Scoped Provider Tests"
Cohesion: 0.11
Nodes (10): Child1, InjectableUsingScoped, InjectableUsingScoped, ScopedController, ScopedInjectableInterface, SideEffectController, getInjectionTokenMetadataKey(), Inject() (+2 more)

### Community 12 - "Example Application Controllers"
Cohesion: 0.12
Nodes (8): app, FirstController, FirstModule, port, ScopedService1, ScopedService2, SharedService, Req

### Community 13 - "Param Decorator Controllers"
Cohesion: 0.21
Nodes (4): SimpleController, Get, Query(), Session()

### Community 14 - "Injection Test Providers"
Cohesion: 0.16
Nodes (8): ConfigurationObject, DatabaseService, GlobalInjectable, IDBService, SingletonController, GLOBAL_GUARD, guardMetadataKey, MetadataFunction

### Community 15 - "Param Decorator Internals"
Cohesion: 0.14
Nodes (11): createMappingDecorator(), argumentResolverFunctionsMetadataKey, BODY_TYPE_KEY, createParamDecorator(), formatQueryValue(), Header(), OptionsResolver, QUERY_TYPE_KEY (+3 more)

### Community 16 - "Scoped Lifecycle Hook Ordering"
Cohesion: 0.17
Nodes (7): ScopedController, ScopedInjectable, ScopedInjectableInterface, SideEffectController, ScopedInjectable, BeforeControllerMethodIsCalled, HttpContext

### Community 17 - "Event Emitter Example"
Cohesion: 0.18
Nodes (8): app, AppModule, port, User, UserListeners, TestListener, TestModule, OnEvent()

### Community 18 - "Body Validation Controllers"
Cohesion: 0.25
Nodes (5): App, AppController, jsonWithMessage(), Post, Body()

### Community 19 - "Event Emitter Runtime"
Cohesion: 0.21
Nodes (3): UserController, TestController, EventEmitter

### Community 20 - "Server-Sent Events"
Cohesion: 0.27
Nodes (5): ExampleModule, SSEExampleController, SSE(), SSEEvent, SSEMessage

### Community 21 - "HTTP Exception Class Family"
Cohesion: 0.20
Nodes (5): BadGatewayException, HttpException, IAmATeapotException, InternalServerErrorException, NotFoundException

### Community 22 - "Guard Decorators and Controllers"
Cohesion: 0.53
Nodes (7): AuthGuardController, GlobalAuthController, MethodGuardController, ThrowingGuardController, UseGuard(), SetMetadata(), Controller()

### Community 24 - "Dependency Import Map"
Cohesion: 0.25
Nodes (8): imports, @danet/handlebars, deno_reflect, @hono, @std/fmt, @std/path, @std/testing, validatte

### Community 25 - "Context and Response Decorators"
Cohesion: 0.25
Nodes (3): SimpleController, Context(), Res

### Community 26 - "HTTP Status Enum and Exceptions"
Cohesion: 0.32
Nodes (3): HTTP_STATUS, MisdirectedException, RequestTimeoutException

### Community 27 - "Deno Tasks and Package Metadata"
Cohesion: 0.29
Nodes (6): license, name, tasks, start:example, test, version

### Community 28 - "Formatter Configuration"
Cohesion: 0.29
Nodes (7): fmt, exclude, options, singleQuote, useTabs, ./coverage/, ./doc/

### Community 29 - "Lint Rule Configuration"
Cohesion: 0.29
Nodes (7): rules, exclude, include, tags, ban-untagged-todo, no-unused-vars, recommended

### Community 31 - "Lint Include and Exclude Paths"
Cohesion: 0.33
Nodes (6): lint, exclude, include, node_modules/, src/, ./**/*.test.ts

### Community 32 - "Publish Exclusion Paths"
Cohesion: 0.33
Nodes (6): publish, exclude, ./example, .github, ./spec, .vscode

### Community 33 - "Injectable Decorator and Scopes"
Cohesion: 0.60
Nodes (3): InjectableOption, injectionData, SCOPE

### Community 34 - "TypeScript Compiler Options"
Cohesion: 0.40
Nodes (5): compilerOptions, emitDecoratorMetadata, experimentalDecorators, jsx, jsxImportSource

### Community 35 - "Package Export Map"
Cohesion: 0.40
Nodes (5): exports, ./hook, ./logger, ./metadata, ./validation

### Community 36 - "CORS Tests"
Cohesion: 0.40
Nodes (3): app, MyController, MyModule

### Community 38 - "Validation DTO Fixtures"
Cohesion: 0.50
Nodes (4): IsNumber, IsString, LengthGreater, DTO

## Ambiguous Edges - Review These
- `Deno-Only Runtime Constraint` → `JSR-Only Distribution (@danet/core)`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **65 isolated node(s):** `name`, `version`, `license`, `./metadata`, `./validation` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Deno-Only Runtime Constraint` and `JSR-Only Distribution (@danet/core)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Get` connect `Param Decorator Controllers` to `Middleware and WebSocket Tests`, `Rate Limiting and Throttling`, `Lifecycle Hooks and KV Queue Tests`, `Exception Filter Tests`, `View Rendering and Application API`, `Test Module Definitions`, `Guard Implementations`, `HTTP Method Decorators`, `Injection and Scoped Provider Tests`, `Example Application Controllers`, `Injection Test Providers`, `Param Decorator Internals`, `Scoped Lifecycle Hook Ordering`, `Event Emitter Example`, `Body Validation Controllers`, `Event Emitter Runtime`, `Guard Decorators and Controllers`, `Context and Response Decorators`, `CORS Tests`, `Base Path Tests`, `Request Scoped Injection Test`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Why does `Module()` connect `Test Module Definitions` to `Application Core and Transport Router`, `Middleware and WebSocket Tests`, `Rate Limiting and Throttling`, `Scheduled Tasks`, `Lifecycle Hooks and KV Queue Tests`, `Exception Filter Tests`, `View Rendering and Application API`, `Guard Implementations`, `HTTP Method Decorators`, `Injection and Scoped Provider Tests`, `Example Application Controllers`, `Injection Test Providers`, `Param Decorator Internals`, `Scoped Lifecycle Hook Ordering`, `Event Emitter Example`, `Body Validation Controllers`, `Server-Sent Events`, `Guard Decorators and Controllers`, `Event Metadata and Module`, `Injectable Decorator and Scopes`, `CORS Tests`, `Event Emitter Module Registration`, `Base Path Tests`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `Injectable()` connect `Guard Implementations` to `Application Core and Transport Router`, `Injectable Decorator and Scopes`, `Middleware and WebSocket Tests`, `Rate Limiting and Throttling`, `Lifecycle Hooks and KV Queue Tests`, `Exception Filter Tests`, `Injection and Scoped Provider Tests`, `Example Application Controllers`, `Injection Test Providers`, `Scoped Lifecycle Hook Ordering`, `Guard Decorators and Controllers`, `Logger`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **What connects `name`, `version`, `license` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Application Core and Transport Router` be split into smaller, more focused modules?**
  _Cohesion score 0.061050875729774814 - nodes in this community are weakly interconnected._
- **Should `Middleware and WebSocket Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.05403348554033485 - nodes in this community are weakly interconnected._