# Modules Specification

## Purpose

Modules are the unit of composition in Danet: each module declares the controllers it exposes, the providers it registers, and the other modules it imports, and the framework bootstraps that graph starting from a single entry module.

## Requirements

### Requirement: Module Declaration

The system SHALL accept `@Module({ imports, controllers, injectables })` on a class, where every property is optional, and SHALL use that metadata to register the module's providers and controllers during bootstrap.

#### Scenario: Module registers controllers and providers

- **WHEN** an application is initialized with a module declaring controllers and injectables
- **THEN** those providers SHALL be resolvable from the container and those controllers SHALL be registered as routes

#### Scenario: Empty module declaration

- **WHEN** a class is decorated with `@Module({})`
- **THEN** bootstrap SHALL succeed and register no controllers or providers for that module

### Requirement: Imported Module Bootstrapping

The system SHALL bootstrap imported modules recursively and complete each import before bootstrapping the importing module.

#### Scenario: Provider from an imported module is available

- **WHEN** module A imports module B, and B declares a provider that a controller of A depends on
- **THEN** the controller of A SHALL be constructed with that provider

### Requirement: Dynamic Modules

The system SHALL accept, anywhere a module class is accepted, a dynamic module object of the shape `{ module, imports?, controllers?, injectables? }`, and SHALL bootstrap it using the metadata carried by the object rather than the metadata attached to the class.

#### Scenario: Configured module produced by a static factory

- **WHEN** a module imports the result of a static factory that returns `{ module: SomeModule, injectables: [{ token, useValue }] }`
- **THEN** the returned providers SHALL be registered and resolvable

### Requirement: Module Instances Participate In The Container

The system SHALL instantiate every bootstrapped module, register that instance in the container under the module class, and treat it like any other resolved instance for lifecycle hook execution.

#### Scenario: Module lifecycle hook runs

- **WHEN** a module class implements `OnAppBootstrap` and the application is initialized
- **THEN** the module instance's `onAppBootstrap` method SHALL be invoked
