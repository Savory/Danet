# Realtime Messaging Specification

## Purpose

Danet supports long-lived connections in two forms: server-sent event routes that stream messages to a client over HTTP, and WebSocket controllers that dispatch incoming socket messages to decorated methods by topic.

## Requirements

### Requirement: Server Sent Event Routes

The system SHALL register a controller method decorated with `@SSE(path)` as a `GET` route that streams server-sent events, where the method returns an `EventTarget` on which the application dispatches `SSEEvent` instances.

#### Scenario: Streaming dispatched events

- **WHEN** a client requests an `@SSE` route and the handler's event target dispatches several `SSEEvent` instances
- **THEN** the client SHALL receive one server-sent event per dispatched message

### Requirement: Server Sent Event Message Shape

The system SHALL write each dispatched message using its `data`, `event`, `id`, and `retry` fields, serializing object payloads as JSON and sending string payloads unchanged.

#### Scenario: Object payload

- **WHEN** an `SSEEvent` carries an object as its `data`
- **THEN** the emitted event's data SHALL be the JSON serialization of that object

### Requirement: Server Sent Event Stream Termination

The system SHALL keep the stream open until a message whose `event` field is `close` is dispatched, and SHALL then close the stream.

#### Scenario: Closing the stream

- **WHEN** the handler dispatches a message with `event: 'close'`
- **THEN** the server SHALL stop streaming and close the connection

### Requirement: WebSocket Controllers

The system SHALL register a class decorated with `@WebSocketController(endpoint)` on that endpoint, upgrade matching requests to a WebSocket connection, and dispatch incoming messages of the shape `{ topic, data }` to the method decorated with `@OnWebSocketMessage(topic)` whose topic matches.

#### Scenario: Message routed to its topic handler

- **WHEN** a client sends `{ topic: 'hello', data: {...} }` on the socket
- **THEN** the method decorated with `@OnWebSocketMessage('hello')` SHALL be invoked

#### Scenario: Handler result sent back

- **WHEN** a topic handler returns a value
- **THEN** that value SHALL be serialized as JSON and sent back over the socket

### Requirement: WebSocket Method Parameters

The system SHALL resolve WebSocket handler parameters with the same parameter decorators used for HTTP handlers, where `@Body` yields the message payload, `@Param` yields values captured from the topic pattern, and `@WebSocket` yields the socket instance.

#### Scenario: Payload and topic parameters

- **WHEN** a handler registered for a parameterized topic declares `@Body()` and `@Param('name')`
- **THEN** it SHALL receive the message payload and the value captured from the topic

### Requirement: WebSocket Guards And Filters

The system SHALL run the relevant guards when a socket connects and again for each incoming message, closing the socket with code `1008` when a guard denies access, and SHALL pass errors thrown by a topic handler to the exception filters, sending the filter's result back over the socket.

#### Scenario: Guard denies a message

- **WHEN** a guard denies an incoming socket message
- **THEN** the socket SHALL be closed with code `1008` and the handler SHALL NOT run

#### Scenario: Filter handles a handler error

- **WHEN** a topic handler throws and a matching exception filter returns a payload
- **THEN** that payload SHALL be serialized and sent back over the socket
