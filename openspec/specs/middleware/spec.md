# Middleware Specification

## Purpose

Middleware lets applications observe or alter a request before and after the controller method runs, either globally for the whole application or selectively for a controller or a single route.

## Requirements

### Requirement: Middleware Forms

The system SHALL accept three forms of middleware: a class implementing `action(context, next)` and resolved through the injection container, a plain function taking `(context, next)`, and a Hono middleware handler.

#### Scenario: Class middleware with dependencies

- **WHEN** a middleware class declaring constructor dependencies is attached to a route
- **THEN** the framework SHALL instantiate it through the container and call its `action` method with the execution context and the next function

#### Scenario: Function middleware

- **WHEN** a plain function is attached as middleware
- **THEN** it SHALL be called with the execution context and the next function

### Requirement: Middleware Attachment

The system SHALL attach middleware through `@Middleware(...)` on a controller class or on a controller method, and through `DanetApplication.addGlobalMiddlewares(...)` for the whole application.

#### Scenario: Method scoped middleware

- **WHEN** `@Middleware(SomeMiddleware)` decorates a single handler
- **THEN** that middleware SHALL run only for requests matching that handler's route

#### Scenario: Global middleware

- **WHEN** middleware is registered with `addGlobalMiddlewares`
- **THEN** it SHALL run for every route of the application

### Requirement: Middleware Execution Order

The system SHALL execute middleware in the order global, then controller level, then method level, and SHALL only invoke the controller pipeline once the last middleware calls `next()`.

#### Scenario: Ordered chain

- **WHEN** global, controller, and method middleware are all registered for one route
- **THEN** they SHALL run in that order before the handler executes

#### Scenario: Calling next twice

- **WHEN** a middleware calls `next()` more than once
- **THEN** an error stating that `next()` was called multiple times SHALL be raised

### Requirement: Middleware Errors

The system SHALL route any error thrown by middleware to the exception handling pipeline instead of invoking the controller method.

#### Scenario: Throwing middleware

- **WHEN** a middleware throws an HTTP exception
- **THEN** the response SHALL carry that exception's status and the controller method SHALL NOT run

### Requirement: Raw Hono Middleware Registration

The system SHALL expose `DanetApplication.use(middleware)` to register a Hono middleware handler for all paths of the underlying server.

#### Scenario: Registering a Hono handler

- **WHEN** `app.use(honoMiddleware)` is called
- **THEN** the handler SHALL be applied to every request served by the application
