# Application Lifecycle Specification

## Purpose

`DanetApplication` is the entry point of a Danet program: it bootstraps the module graph, starts and stops the HTTP server, and exposes the application-wide configuration hooks such as CORS, base path, and the underlying server instance.

## Requirements

### Requirement: Application Initialization

The system SHALL expose `init(EntryModule)` which bootstraps the entry module and its import graph, registers every controller, and then runs the application bootstrap hooks, and SHALL reject when the module graph cannot be resolved.

#### Scenario: Successful initialization

- **WHEN** `await app.init(AppModule)` completes
- **THEN** the module's providers SHALL be resolvable and its controllers SHALL be routable

#### Scenario: Unresolvable module graph

- **WHEN** the entry module graph contains a controller whose dependency is not provided
- **THEN** `init` SHALL reject with an error describing the missing dependency

### Requirement: Server Start And Stop

The system SHALL expose `listen(port)` which starts the HTTP server, defaults to port `3000`, resolves with the effective listening port, and `close()` which runs the application close hooks and shuts the server down.

#### Scenario: Listening on an ephemeral port

- **WHEN** `await app.listen(0)` is called
- **THEN** the promise SHALL resolve with the randomly assigned port the server is listening on

#### Scenario: Shutting the server down

- **WHEN** `await app.close()` is called on a listening application
- **THEN** the server SHALL stop serving requests

### Requirement: Application Base Path

The system SHALL expose `registerBasePath(basePath)` which prefixes every subsequently registered HTTP route, removing a trailing slash from the given path.

#### Scenario: Prefixed routes

- **WHEN** `app.registerBasePath('/api/')` is called before `init` and a controller exposes `todo`
- **THEN** the handler SHALL be reachable at `/api/todo`

### Requirement: CORS Configuration

The system SHALL expose `enableCors(options?)` which applies CORS handling to every route of the application, accepting origin, allowed methods, allowed headers, exposed headers, max age, and credentials options.

#### Scenario: Preflight request

- **WHEN** CORS is enabled and a preflight `OPTIONS` request is received
- **THEN** the application SHALL answer with the CORS response rather than a routing error

### Requirement: Underlying Server Access

The system SHALL expose the underlying Hono application instance through the `router` accessor so advanced use cases can register handlers directly on it.

#### Scenario: Direct access

- **WHEN** `app.router` is read
- **THEN** it SHALL return the Hono instance backing the application

### Requirement: External Transports

The system SHALL expose `useTransport(metadataKey, transport)`, and when it is called before `init`, every controller carrying that metadata key SHALL be handed to the transport instead of being registered on the built-in HTTP and WebSocket routers.

#### Scenario: Controller claimed by a transport

- **WHEN** a transport is registered for a metadata key and a bootstrapped module declares a controller carrying that key
- **THEN** the transport SHALL receive that controller together with the metadata value, and no HTTP route SHALL be created for it
