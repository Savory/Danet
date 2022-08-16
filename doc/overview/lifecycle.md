A Danet application, as well as every application element, has a lifecycle managed by Danet. Danet provides **lifecycle hooks** that give visibility into key lifecycle events, and the ability to act (run registered code on your `injectable` or `controller`) when they occur.


### Lifecycle events

Lifecycle events happen during application bootstrapping and shutdown. Danet calls registered lifecycle hook methods on `injectables` and `controllers` at each of the following lifecycle events. As shown in the diagram above, Danet also calls the appropriate underlying methods to begin listening for connections, and to stop listening for connections.

`OnAppClose` is only triggered if you explicitly call `app.close()`.

| Lifecycle hook method           | Lifecycle event triggering the hook method call                 |
| ------------------------------- |-----------------------------------------------------------------|
| `OnAppBootstrap()`                | Called once after all dependencies have been injected.          |
| `OnAppClose()`      | Called on `app.close` right before shutting down connections. |

!!!warning **Warning** 
The lifecycle hooks listed above are not triggered for **request-scoped** classes. Request-scoped classes are not tied to the application lifecycle and their lifespan is unpredictable. They are exclusively created for each request and deleted after the response is sent.
!!!

### Usage

Each lifecycle hook is represented by an interface. Interfaces are technically optional because they do not exist after TypeScript compilation. Nonetheless, it's good practice to use them in order to benefit from strong typing and editor tooling. To register a lifecycle hook, implement the appropriate interface. For example, to register a method to be called after injections has been done on a particular class (e.g., Controller or Injectable), implement the `OnAppBootstrap` interface by supplying an `onAppBootstrap()` method, as shown below:

```typescript user-service.ts
import { Injectable, AuthGuard } from 'https://deno.land/x/danet/mod.ts';

@Injectable()
export class UsersService implements OnAppBootstrap {
  onAppBootstrap() {
    console.log(`The module has been initialized.`);
  }
}
```

### Asynchronous initialization

`OnAppBootstrap` hook allow you to defer the application initialization process (return a `Promise` or mark the method as `async` and `await` an asynchronous method completion in the method body).

```typescript
async onAppBootstrap(): Promise<void> {
  await this.fetch();
}
```
