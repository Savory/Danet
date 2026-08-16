# Guards Specification

## Purpose

Guards decide whether a request is allowed to reach its handler, giving applications a single place to express authentication and authorization rules for a route, a controller, or the whole application.

## Requirements

### Requirement: Guard Contract

The system SHALL treat a guard as a class implementing `canActivate(context)` returning a boolean or a promise of a boolean, and SHALL resolve guard classes through the injection container so their dependencies are injected.

#### Scenario: Guard allows the request

- **WHEN** a guard's `canActivate` resolves to `true`
- **THEN** the request SHALL continue to parameter resolution and the controller method

#### Scenario: Guard with dependencies

- **WHEN** a guard declares constructor dependencies provided by a bootstrapped module
- **THEN** the guard instance SHALL be constructed with those dependencies

### Requirement: Guard Registration

The system SHALL apply guards attached with `@UseGuard(Guard)` on a controller class or on a controller method, and SHALL apply an application-wide guard registered as a provider under the `GLOBAL_GUARD` token.

#### Scenario: Route level guard

- **WHEN** `@UseGuard(SomeGuard)` decorates a single handler
- **THEN** that guard SHALL run only for requests matching that handler's route

#### Scenario: Global guard

- **WHEN** a module declares `{ useClass: SomeGuard, token: GLOBAL_GUARD }`
- **THEN** that guard SHALL run for every request of the application

### Requirement: Guard Execution Order

The system SHALL execute the global guard first, then the controller guard, then the method guard, and SHALL stop the pipeline as soon as one of them denies access.

#### Scenario: Global guard denies first

- **WHEN** the global guard denies access on a route that also declares a controller guard
- **THEN** the controller guard SHALL NOT decide the outcome and the request SHALL be rejected

### Requirement: Denied Request Response

The system SHALL reject a request with a `403` forbidden response when a guard returns a falsy value, and SHALL route an exception thrown inside a guard to the exception handling pipeline.

#### Scenario: canActivate returns false

- **WHEN** a guard returns `false`
- **THEN** the response status SHALL be `403` and the controller method SHALL NOT be invoked

#### Scenario: Guard throws

- **WHEN** a guard throws an HTTP exception
- **THEN** the response SHALL reflect that exception's status and message

### Requirement: Guard Access To The Execution Context

The system SHALL give guards an execution context exposing the current request, the target class through `getClass()`, and the target handler through `getHandler()`, and changes a guard makes to the response headers SHALL be visible on the final response.

#### Scenario: Guard sets a response header

- **WHEN** a guard sets a header on the context and allows the request
- **THEN** the successful response SHALL carry that header
