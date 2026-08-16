# HTTP Routing Specification

## Purpose

Danet turns decorated controller classes into HTTP routes, mapping each decorated method to a path and verb, and converting the method's return value into an HTTP response.

## Requirements

### Requirement: Controller And Route Registration

The system SHALL register every class listed in a module's `controllers` and decorated with `@Controller(basePath)`, and SHALL create one route per method decorated with an HTTP method decorator.

#### Scenario: Decorated method becomes a route

- **WHEN** a controller decorated with `@Controller('nice-controller')` declares a method decorated with `@Get('/')`
- **THEN** a `GET /nice-controller` route SHALL respond with the method's result

#### Scenario: Undecorated members are not routed

- **WHEN** a controller declares a constructor or a lifecycle hook method
- **THEN** no route SHALL be created for it

### Requirement: Route Path Composition

The system SHALL build a route path by concatenating the optional application base path, the controller base path, and the method endpoint, trimming leading and trailing slashes from each segment, and SHALL use `/` when both controller and method paths are empty.

#### Scenario: Base path prefixes every route

- **WHEN** `app.registerBasePath('/api/')` is called before initialization and a controller declares `@Controller('todo')` with `@Get('')`
- **THEN** the handler SHALL be reachable at `GET /api/todo`

#### Scenario: Path parameters are preserved

- **WHEN** a method is decorated with `@Get('hello-world/:name')`
- **THEN** the route SHALL match requests with any value in the `:name` segment

### Requirement: HTTP Method Decorators

The system SHALL provide `@Get`, `@Post`, `@Put`, `@Patch`, `@Delete`, `@Options`, `@Head`, and `@All` route decorators, where `@All` matches every HTTP method.

#### Scenario: Verb specific route

- **WHEN** a method is decorated with `@Post('/')` and a `GET` request is sent to that path
- **THEN** the handler SHALL NOT be invoked for the `GET` request

#### Scenario: Catch-all route

- **WHEN** a method is decorated with `@All('/')`
- **THEN** requests using any HTTP verb on that path SHALL reach the handler

### Requirement: Response Serialization

The system SHALL serialize a handler's return value: an object is sent as JSON, a string is sent as text, and a returned `Response` is sent as-is with its own status, headers, and body.

#### Scenario: Object return value

- **WHEN** a handler returns a plain object
- **THEN** the response body SHALL be that object serialized as JSON

#### Scenario: Response return value

- **WHEN** a handler returns a `Response` carrying custom status and headers
- **THEN** the client SHALL receive that exact status, headers, and body

### Requirement: Response Status Code

The system SHALL respond with status `200` by default and SHALL use the status declared by `@HttpCode(status)` on the handler when present.

#### Scenario: Custom status code

- **WHEN** a handler is decorated with `@HttpCode(203)` and returns a value
- **THEN** the response status SHALL be `203`

### Requirement: Request Handling Pipeline Order

The system SHALL process each matched request by running middleware, then guards, then parameter resolution, then the controller method, and SHALL route any error raised in that pipeline to exception handling.

#### Scenario: Guard rejects before the handler runs

- **WHEN** a guard on the route denies access
- **THEN** the controller method SHALL NOT be invoked and an error response SHALL be returned
