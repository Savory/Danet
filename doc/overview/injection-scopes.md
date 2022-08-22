For people coming from different programming language backgrounds, it might be unexpected to learn that in Danet, almost everything is shared across incoming requests. We have a connection pool to the database, singleton services with global state, etc. Remember that Node.js doesn't follow the request/response Multi-Threaded Stateless Model in which every request is processed by a separate thread. Hence, using singleton instances is fully **safe** for our applications.

However, there are edge-cases when request-based lifetime may be the desired behavior, for instance per-request caching in GraphQL applications, request tracking, and multi-tenancy. Injection scopes provide a mechanism to obtain the desired provider lifetime behavior.

### Provider scope

A provider can have any of the following scopes:

<table>
  <tr>
    <td><code>GLOBAL</code></td>
    <td>A single instance of the provider is shared across the entire application. The instance lifetime is tied directly to the application lifecycle. Once the application has bootstrapped, all singleton providers have been instantiated. Singleton scope is used by default.</td>
  </tr>
  <tr>
    <td><code>REQUEST</code></td>
    <td>A new instance of the provider is created exclusively for each incoming <strong>request</strong>.  The instance is free'd after the request has completed processing.</td>
  </tr>
</table>


!!!info Hint
Using singleton scope is **recommended** for most use cases. Sharing providers across consumers and across requests means that an instance can be cached and its initialization occurs only once, during application startup.
!!!

### Usage

Specify injection scope by passing the `scope` property to the `@Injectable()` decorator options object:

```typescript
import { Injectable, Scope } from 'https://deno.land/x/danet/mod.ts';

@Injectable({ scope: Scope.REQUEST })
export class TodoService {}
```

Singleton scope is used by default, and need not be declared. If you do want to declare a provider as singleton scoped, use the `Scope.GLOBAL` value for the `scope` property.

### Controller scope

Controllers can also have scope, which applies to all request method handlers declared in that controller. Like provider scope, the scope of a controller declares its lifetime. For a request-scoped controller, a new instance is created for each inbound request, and garbage-collected when the request has completed processing.

Declare controller scope with the `scope` property of the `ControllerOptions` object:

```typescript
@Controller({
  path: 'todo',
  scope: Scope.REQUEST,
})
export class TodoController {}
```

### Scope hierarchy

The `REQUEST` scope bubbles up the injection chain. A controller that depends on a request-scoped provider will, itself, be request-scoped.

Imagine the following dependency graph: `TodoController <- TodoService <- TodoRepository`. If `TodoService` is request-scoped (and the others are default singletons), the `TodoController` will become request-scoped as it is dependent on the injected service. The `TodoRepository`, which is not dependent, would remain singleton-scoped.

### Access context

You may want to access a reference to the original request object when using request-scoped providers. You can access it using the `beforeControllerMethodIsCalled` method as following. And yes, it can be async.

```typescript
import { Injectable, Scope, Inject, HttpContext } from 'https://deno.land/x/danet/mod.ts';

@Injectable({ scope: Scope.REQUEST })
export class TodoService {
  constructor() {}
  
  async beforeControllerMethodIsCalled(ctx: HttpContext) {
    //do something with the context
  }
}
```
### Performance

Using request-scoped providers will have an impact on application performance. We have to create an instance of your class on each request. Hence, it will slow down your average response time and overall benchmarking result. Unless a provider must be request-scoped, it is strongly recommended that you use the default singleton scope.


!!!info Hint
Although it all sounds quite intimidating, a properly designed application that leverages request-scoped providers should not slow down by more than ~5% latency-wise.
!!!