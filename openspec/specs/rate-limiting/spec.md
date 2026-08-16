# Rate Limiting Specification

## Purpose

Rate limiting protects routes by counting requests per caller within a time window, rejecting callers that exceed the configured limit and advertising the remaining allowance through response headers.

## Requirements

### Requirement: Throttler Configuration

The system SHALL expose `ThrottlerModule.forRoot(options, storage?)` which configures one or more throttlers, each declaring a `ttl` window in milliseconds, a request `limit`, and an optional `name`, and SHALL default to an in-process in-memory storage when no storage is supplied.

#### Scenario: Single throttler configuration

- **WHEN** a module imports `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])`
- **THEN** the throttler configuration and its storage SHALL be available to the throttler guard

#### Scenario: Custom storage

- **WHEN** a storage implementing `increment(key, ttl)` is passed to `forRoot`
- **THEN** the throttler SHALL track request counts through that storage instead of the in-memory one

### Requirement: Throttler Guard Enforcement

The system SHALL enforce the configured limits through `ThrottlerGuard`, which applications register either as the application-wide guard under the `GLOBAL_GUARD` token or on a controller or handler with `@UseGuard(ThrottlerGuard)`, and SHALL enforce every configured throttler for each request.

#### Scenario: Request within the limit

- **WHEN** a caller has made fewer requests than the limit within the window
- **THEN** the request SHALL be allowed to proceed

#### Scenario: Request over the limit

- **WHEN** a caller exceeds the configured limit within the window
- **THEN** the response SHALL have status `429`

#### Scenario: Window expiry

- **WHEN** the `ttl` window elapses after a caller was blocked
- **THEN** the caller's count SHALL restart and requests SHALL be allowed again

### Requirement: Rate Limit Response Headers

The system SHALL set `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` on throttled responses, SHALL add `Retry-After` when a request is rejected, and SHALL suffix those header names with the throttler name when a named or multiple throttlers are configured.

#### Scenario: Headers on an allowed request

- **WHEN** a request is allowed under a limit of 2 and it is the first one in the window
- **THEN** the response SHALL report a limit of `2` and a remaining allowance of `1`

#### Scenario: Retry hint on rejection

- **WHEN** a request is rejected for exceeding the limit
- **THEN** the response SHALL carry a `Retry-After` value expressed in seconds until the window resets

### Requirement: Per Route Overrides

The system SHALL honour `@Throttle(overrides)` on a controller or handler to override the `ttl` and `limit` of the named throttlers for that target, and `@SkipThrottle()` to bypass throttling entirely, with handler metadata taking precedence over controller metadata.

#### Scenario: Overridden limit

- **WHEN** a handler is decorated with `@Throttle({ default: { ttl: 60000, limit: 1 } })` under a globally configured higher limit
- **THEN** the handler SHALL be rejected once the overridden limit is exceeded

#### Scenario: Skipped route

- **WHEN** a handler is decorated with `@SkipThrottle()`
- **THEN** requests to that handler SHALL never be rejected by the throttler

### Requirement: Caller Identification

The system SHALL identify a caller from the `x-forwarded-for` header, falling back to `x-real-ip`, then to the connection's remote address, and SHALL key counters by caller, throttler name, controller, and handler.

#### Scenario: Separate routes have separate counters

- **WHEN** the same caller reaches two different handlers
- **THEN** each handler SHALL count that caller's requests independently
