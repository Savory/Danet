# Request Parameters Specification

## Purpose

Controller methods declare what they need from the incoming request through parameter decorators, and Danet resolves each decorated parameter from the execution context before invoking the handler.

## Requirements

### Requirement: Parameter Decorator Resolution

The system SHALL resolve every decorated controller method parameter from the current execution context before calling the handler, and SHALL pass the resolved values at their declared positions.

#### Scenario: Multiple decorated parameters

- **WHEN** a handler declares parameters decorated with different parameter decorators
- **THEN** each parameter SHALL receive the value produced by its own decorator, in declaration order

### Requirement: Route And Query Parameters

The system SHALL provide `@Param(name)` returning the named path parameter, and `@Query()` returning query values, where `@Query(name, options?)` returns one parameter and `@Query(options?)` returns every parameter as an object.

#### Scenario: Path parameter

- **WHEN** a request matches a route declared as `hello-world/:name` and the handler declares `@Param('name')`
- **THEN** the parameter SHALL receive the value of that path segment

#### Scenario: Repeated query parameter

- **WHEN** a query parameter appears several times and the decorator is given `{ value: 'array' }`
- **THEN** the parameter SHALL receive every value as an array, whereas `'first'`, `'last'`, or no option SHALL yield a single value

### Requirement: Body Parameter And Validation

The system SHALL provide `@Body(prop?)` which parses the request body as JSON and returns the whole body or the named property, and SHALL validate the extracted value against the parameter's declared class type when one is declared.

#### Scenario: Valid body

- **WHEN** a request body satisfies the validation rules of the declared parameter class
- **THEN** the handler SHALL be invoked with the parsed body

#### Scenario: Invalid body

- **WHEN** a request body violates the validation rules of the declared parameter class
- **THEN** the request SHALL fail with a `400` response carrying the validation reasons

### Requirement: Header And Session Parameters

The system SHALL provide `@Header(name?)` returning a single header value or the whole header collection, and `@Session(prop?)` returning the session stored on the context or one of its properties.

#### Scenario: Named header

- **WHEN** the handler declares `@Header('x-custom')` and the request carries that header
- **THEN** the parameter SHALL receive the header value, and SHALL be undefined when the header is absent

### Requirement: Context Access Parameters

The system SHALL provide `@Req`, `@Res`, and `@Context` parameter decorators giving access to the current request, the current response object, and the full execution context.

#### Scenario: Mutating the response through @Res

- **WHEN** a handler receives the response via `@Res()`, sets a header on it, and returns a value
- **THEN** the final response SHALL carry that header together with the serialized return value

#### Scenario: Building the response through @Context

- **WHEN** a handler receives the execution context via `@Context()` and returns a response built from it
- **THEN** the client SHALL receive that response, including headers set through the context
