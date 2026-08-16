# Scheduling Specification

## Purpose

Scheduling lets providers declare methods that the framework runs on a cron expression, on a repeating interval, or once after a delay, without any manual timer wiring.

## Requirements

### Requirement: Schedule Module Activation

The system SHALL register scheduled methods only when the `ScheduleModule` is part of the application's module graph, and SHALL scan every resolved provider for scheduling metadata during application bootstrap.

#### Scenario: Module not imported

- **WHEN** a provider declares a scheduled method but the application does not import `ScheduleModule`
- **THEN** the method SHALL NOT be scheduled

### Requirement: Cron Scheduled Methods

The system SHALL run a provider method decorated with `@Cron(expression)` on the schedule described by the cron expression, and SHALL invoke it with its owning instance as `this`.

#### Scenario: Cron method runs on schedule

- **WHEN** a provider method is decorated with `@Cron` and its scheduled time arrives
- **THEN** the method SHALL be invoked on the provider instance

### Requirement: Interval And Timeout Scheduled Methods

The system SHALL run a provider method decorated with `@Interval(ms)` repeatedly every `ms` milliseconds, and a method decorated with `@Timeout(ms)` exactly once after `ms` milliseconds.

#### Scenario: Interval method repeats

- **WHEN** a method decorated with `@Interval(ms)` is registered and several intervals elapse
- **THEN** the method SHALL have been invoked once per elapsed interval

#### Scenario: Timeout method runs once

- **WHEN** a method decorated with `@Timeout(ms)` is registered and the delay elapses
- **THEN** the method SHALL have been invoked exactly once

### Requirement: Schedule Expression Constants

The system SHALL expose a `CronExpression` enumeration of common cron strings and an `IntervalExpression` enumeration of common millisecond durations for use with the scheduling decorators.

#### Scenario: Using a named expression

- **WHEN** a method is decorated with `@Cron(CronExpression.EVERY_MINUTE)`
- **THEN** it SHALL be scheduled with the corresponding cron string

### Requirement: Schedule Teardown

The system SHALL cancel every registered cron job, interval, and timeout when the application closes.

#### Scenario: Closing the application

- **WHEN** `app.close()` is awaited on an application with scheduled methods
- **THEN** no further scheduled invocation SHALL occur
