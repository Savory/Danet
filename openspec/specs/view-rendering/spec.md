# View Rendering Specification

## Purpose

Danet can answer requests with server-rendered HTML instead of JSON, by pairing a pluggable template renderer with a handler decorator, and it can serve static assets from a directory on disk.

## Requirements

### Requirement: Renderer Registration

The system SHALL accept a renderer implementing `setRootDir(directory)` and `render(filename, data)` through `DanetApplication.setRenderer(renderer)`, and SHALL expose `setViewEngineDir(path)` to set the directory the registered renderer resolves templates from.

#### Scenario: Registering a renderer

- **WHEN** `app.setRenderer(renderer)` and `app.setViewEngineDir(path)` are called
- **THEN** template rendering SHALL resolve templates from that directory using that renderer

#### Scenario: Built-in Handlebars renderer

- **WHEN** `HandlebarRenderer` is registered as the application renderer
- **THEN** handler templates SHALL be rendered with Handlebars

### Requirement: Rendered Handler Responses

The system SHALL render the template named by `@Render(fileName)` on a handler, using the handler's return value as the template data, and SHALL respond with the rendered HTML.

#### Scenario: Rendering a template with data

- **WHEN** a handler decorated with `@Render('index')` returns an object and a renderer is registered
- **THEN** the response SHALL be the HTML produced by rendering `index` with that object

#### Scenario: No renderer registered

- **WHEN** a handler decorated with `@Render` is called while no renderer is registered
- **THEN** the return value SHALL be serialized as a normal response instead of being rendered

### Requirement: Static Asset Serving

The system SHALL expose `useStaticAssets(path)` which serves files from that directory for matching request paths, defaulting to `index.html` for directory requests and setting a content type derived from the file extension.

#### Scenario: Serving a file

- **WHEN** static assets are enabled for a directory containing `test.txt` and `GET /test.txt` is requested
- **THEN** the response SHALL contain that file's contents

#### Scenario: No matching file

- **WHEN** a request path does not match any file in the static directory
- **THEN** the request SHALL continue to the application's routes
