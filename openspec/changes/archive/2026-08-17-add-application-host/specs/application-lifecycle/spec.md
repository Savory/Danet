## ADDED Requirements

### Requirement: Injectable Application Host

The system SHALL make the running application available through dependency injection under a public token, from module instantiation onward, so injectables and module lifecycle hooks can access the application and its underlying HTTP router without holding an external reference.

#### Scenario: Injectable receives the application

- **WHEN** an injectable declares a constructor parameter injected with the application host token and the application is initialized
- **THEN** the parameter SHALL resolve to the running application instance

#### Scenario: Module hook mounts a route through the host

- **WHEN** a module's `onAppBootstrap` hook obtains the application through the host token and registers a route on its underlying router
- **THEN** that route SHALL be served once the application starts listening

#### Scenario: Most recent application wins

- **WHEN** two applications are initialized sequentially in the same process
- **THEN** the host token SHALL resolve to the most recently initialized application
