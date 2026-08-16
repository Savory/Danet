# Dependency Injection Specification

## Purpose

Danet resolves and shares application objects through a decorator-driven injection container, so classes declare their collaborators as constructor parameters and the framework supplies instances with the requested lifetime.

## Requirements

### Requirement: Injectable Declaration And Scopes

The system SHALL treat classes decorated with `@Injectable()` as providers, and SHALL honour the `scope` option, which defaults to `SCOPE.GLOBAL` and also accepts `SCOPE.REQUEST` and `SCOPE.TRANSIENT`.

#### Scenario: Global scope is a singleton

- **WHEN** a class declared with the default or `SCOPE.GLOBAL` option is resolved several times
- **THEN** every resolution SHALL return the same instance

#### Scenario: Transient scope produces a new instance per resolution

- **WHEN** a class declared with `SCOPE.TRANSIENT` is resolved twice
- **THEN** each resolution SHALL return a freshly constructed instance

### Requirement: Constructor Injection

The system SHALL inject constructor parameters based on their declared parameter types, resolving each parameter from the injection container before instantiating the class.

#### Scenario: Declared dependency is supplied

- **WHEN** a controller or provider declares a constructor parameter whose type is registered as an injectable
- **THEN** the framework SHALL construct the class with an instance of that dependency

#### Scenario: Missing dependency fails bootstrap

- **WHEN** a class declares a constructor parameter that no module provides
- **THEN** application initialization SHALL reject with an error naming the class and the unresolvable dependency

### Requirement: Token Based Providers

The system SHALL support providers identified by a string token, declared as `{ token, useClass }` or `{ token, useValue }` in a module's `injectables`, and consumed through `@Inject(token)` on a constructor parameter.

#### Scenario: Value provider injected by token

- **WHEN** a module declares `{ token: 'MY_TOKEN', useValue: someValue }` and a class injects `@Inject('MY_TOKEN')`
- **THEN** the class SHALL receive `someValue` as that constructor argument

#### Scenario: Class provider injected by token

- **WHEN** a module declares `{ token: 'MY_TOKEN', useClass: SomeClass }`
- **THEN** resolving `'MY_TOKEN'` SHALL return an instance of `SomeClass`

### Requirement: Request Scoped Resolution

The system SHALL create at most one instance of a `SCOPE.REQUEST` provider per execution context, reuse it for every resolution within that same request, and propagate non-singleton behaviour to any class that depends on a request-scoped or transient provider.

#### Scenario: Same instance within one request

- **WHEN** two collaborators resolve the same request-scoped provider while handling a single request
- **THEN** both SHALL receive the same instance

#### Scenario: Consumer of a request-scoped provider is not a singleton

- **WHEN** a controller depends on a request-scoped provider and is resolved twice
- **THEN** the two resolutions SHALL return different controller instances

### Requirement: Container Lookup API

The system SHALL expose `DanetApplication.get(TypeOrToken)` to retrieve an instance from the container, and SHALL throw when the type or token was never registered.

#### Scenario: Retrieving a registered provider

- **WHEN** `app.get(SomeProvider)` is called after `app.init(...)` for a provider declared in a bootstrapped module
- **THEN** the call SHALL return the resolved instance

#### Scenario: Retrieving an unknown provider

- **WHEN** `app.get(UnregisteredType)` is called
- **THEN** the call SHALL throw an error stating that the type was not injected
