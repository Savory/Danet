# Exception Handling Specification

## Purpose

Danet converts errors raised anywhere in the request pipeline into HTTP responses, offering a catalogue of HTTP exceptions and letting applications override the response through exception filters.

## Requirements

### Requirement: HTTP Exception Catalogue

The system SHALL expose `HttpException(status, description)` as the base HTTP error and SHALL provide named subclasses for the common HTTP error statuses, each carrying its own status and description.

#### Scenario: Throwing a named exception

- **WHEN** a handler throws `NotFoundException`
- **THEN** the response status SHALL be `404`

#### Scenario: Throwing a custom HTTP exception

- **WHEN** a handler throws `new HttpException(418, 'I am a teapot')`
- **THEN** the response SHALL carry status `418` and that description in its message

### Requirement: Default Error Response

The system SHALL respond to an uncaught error with a JSON body containing the error's own enumerable properties plus a `status` and a `message`, defaulting to status `500` and message `Internal server error!` when the error carries neither.

#### Scenario: Plain error

- **WHEN** a handler throws an `Error` with no status
- **THEN** the response status SHALL be `500` and the body SHALL include the error message

#### Scenario: Custom error fields

- **WHEN** a handler throws an error carrying extra fields
- **THEN** those fields SHALL appear in the JSON error response

### Requirement: Exception Filters

The system SHALL accept exception filters implementing `catch(exception, context)`, attached with `@UseFilter(Filter)` on a controller or a handler, and SHALL use a filter's returned response as the response for that request.

#### Scenario: Filter returns a response

- **WHEN** a handler throws and its controller declares a filter returning a custom response
- **THEN** the client SHALL receive that response instead of the default error response

#### Scenario: Filters are injectable

- **WHEN** a filter declares constructor dependencies provided by a bootstrapped module
- **THEN** the filter instance SHALL be constructed through the injection container

### Requirement: Filter Error Type Narrowing

The system SHALL restrict a filter decorated with `@Catch(ErrorType)` to errors that are instances of `ErrorType`, and SHALL skip that filter for any other error.

#### Scenario: Matching error type

- **WHEN** a handler throws an instance of the type declared in `@Catch`
- **THEN** the filter SHALL handle the error

#### Scenario: Non matching error type

- **WHEN** a handler throws an error that is not an instance of the declared type
- **THEN** the filter SHALL be skipped and handling SHALL fall through to the remaining filters or the default error response

### Requirement: Filter Resolution Order

The system SHALL look for a matching filter on the controller first, then on the handler, then among the filters registered with `DanetApplication.useGlobalExceptionFilter`, and SHALL use the first response returned.

#### Scenario: Global filter as a fallback

- **WHEN** neither the controller nor the handler declares a filter that returns a response
- **THEN** a registered global exception filter SHALL be given the chance to produce the response
