# Events Specification

## Purpose

The event emitter lets parts of an application communicate in process without depending on each other, by publishing payloads on named channels that decorated provider methods subscribe to.

## Requirements

### Requirement: Event Emitter Availability

The system SHALL make an `EventEmitter` provider available to the application when the `EventEmitterModule` is imported, injectable like any other provider.

#### Scenario: Injecting the emitter

- **WHEN** a module imports `EventEmitterModule` and a provider declares an `EventEmitter` constructor parameter
- **THEN** the provider SHALL receive the shared emitter instance

### Requirement: Declarative Event Listeners

The system SHALL subscribe every provider method decorated with `@OnEvent(channel)` to that channel during application bootstrap, and SHALL invoke the method bound to its owning instance when the channel receives a payload.

#### Scenario: Listener receives the payload

- **WHEN** a decorated listener exists for a channel and a payload is emitted on it
- **THEN** the method SHALL be called with that payload and with its own instance as `this`

#### Scenario: Several listeners on one channel

- **WHEN** two decorated methods listen to the same channel and a payload is emitted
- **THEN** both SHALL be invoked with the payload

### Requirement: Emitting Events

The system SHALL expose `emit(channel, payload)` which dispatches the payload to every listener subscribed to that channel, and SHALL throw when no listener is registered for the channel.

#### Scenario: Emitting to a channel with no listener

- **WHEN** `emit` is called for a channel that has no registered listener
- **THEN** it SHALL throw an error naming the channel

### Requirement: Unsubscribing

The system SHALL expose `unsubscribe(channel?)` which removes the listeners of the given channel, or of every channel when no channel is given, and SHALL unsubscribe all listeners when the application closes.

#### Scenario: Emitting after unsubscribing

- **WHEN** a channel's listeners have been removed and a payload is emitted on it
- **THEN** the emit SHALL throw because the channel has no listener left
