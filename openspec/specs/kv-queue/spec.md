# KV Queue Specification

## Purpose

The KV queue capability gives applications a durable, Deno KV backed message queue: producers enqueue typed messages and decorated provider methods consume them asynchronously.

## Requirements

### Requirement: Queue Module Configuration

The system SHALL expose `KvQueueModule.forRoot(kvName?)` returning a dynamic module that provides the `KvQueue` service and the queue name, so importing that result makes the queue available to the application.

#### Scenario: Importing the configured module

- **WHEN** a module imports `KvQueueModule.forRoot('my-queue')`
- **THEN** the `KvQueue` service SHALL be injectable into the application's providers and controllers

### Requirement: Queue Connection Lifecycle

The system SHALL open the Deno KV store during application bootstrap and close it when the application closes.

#### Scenario: Sending before bootstrap completes

- **WHEN** the application has been initialized
- **THEN** the queue SHALL be connected and able to accept messages

#### Scenario: Application shutdown

- **WHEN** `app.close()` is awaited
- **THEN** the underlying KV store SHALL be closed

### Requirement: Sending Queue Messages

The system SHALL expose `KvQueue.sendMessage(type, data)` which enqueues a message carrying the given type and payload.

#### Scenario: Enqueuing a message

- **WHEN** `sendMessage('my-channel', payload)` is called
- **THEN** the message SHALL be enqueued for delivery to the listener registered for `'my-channel'`

### Requirement: Queue Message Listeners

The system SHALL register every provider method decorated with `@OnQueueMessage(channel)` as the listener for that channel during application bootstrap, and SHALL invoke it with the message payload when a matching message is dequeued.

#### Scenario: Listener receives the payload

- **WHEN** a message of a channel with a registered listener is dequeued
- **THEN** that listener SHALL be called with the message payload

#### Scenario: Message with no listener

- **WHEN** a dequeued message carries a type that no listener handles
- **THEN** an unhandled message type error SHALL be raised
