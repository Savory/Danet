# Lifecycle Hooks Specification

## Purpose

Lifecycle hooks let providers, controllers, and modules run code when the application starts, when it shuts down, and when a request-scoped instance is created for an incoming request.

## Requirements

### Requirement: Application Bootstrap Hook

The system SHALL invoke `onAppBootstrap()` exactly once on every globally scoped instance held by the container, including providers, controllers, and module instances, during `DanetApplication.init`, and SHALL await asynchronous hooks before initialization completes.

#### Scenario: Provider bootstrap hook

- **WHEN** a globally scoped provider implements `OnAppBootstrap` and the application is initialized
- **THEN** its `onAppBootstrap` method SHALL have been called once when `init` resolves

#### Scenario: Controller and module bootstrap hooks

- **WHEN** a controller class and a module class implement `OnAppBootstrap`
- **THEN** both instances SHALL have their hook invoked during initialization

### Requirement: Application Close Hook

The system SHALL invoke `onAppClose()` on every globally scoped instance held by the container when `DanetApplication.close()` is called, before the HTTP server is shut down.

#### Scenario: Close hook on shutdown

- **WHEN** a provider implementing `OnAppClose` is registered and `app.close()` is awaited
- **THEN** its `onAppClose` method SHALL have been called once

### Requirement: Hook Scope Restriction

The system SHALL run application bootstrap and close hooks only on globally scoped instances, and SHALL NOT run them on request-scoped or transient instances.

#### Scenario: Request-scoped provider is skipped

- **WHEN** a provider declared with `SCOPE.REQUEST` implements `OnAppBootstrap`
- **THEN** its hook SHALL NOT be invoked at application initialization

### Requirement: Before Controller Method Hook

The system SHALL invoke `beforeControllerMethodIsCalled(context)` with the current execution context on a request-scoped instance when that instance is created while handling a request, before the controller method runs.

#### Scenario: Request-scoped provider prepares per-request state

- **WHEN** a request-scoped provider implements `BeforeControllerMethodIsCalled` and is a dependency of the handling controller
- **THEN** the hook SHALL run with the request's execution context before the controller method executes
