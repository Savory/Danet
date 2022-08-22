---
order: 97
---


A module is a class annotated with a `@Module()` decorator. The `@Module()` decorator provides metadata that **Danet** makes use of to organize the application structure.

Each application has at least one module, a **root module**. The root module is the starting point Danet uses to build the **application graph** - the internal data structure Danet uses to resolve module and provider relationships and dependencies. While very small applications may theoretically have just the root module, this is not the typical case. We want to emphasize that modules are **strongly** recommended as an effective way to organize your components. Thus, for most applications, the resulting architecture will employ multiple modules, each declaring a closely related set of **capabilities**.

The `@Module()` decorator takes a single object whose properties describe the module:

|               |                                                                                                                    |
|---------------|--------------------------------------------------------------------------------------------------------------------|
| `injectables` | the injectables that will be instantiated by the Danet injector and that may be shared at least across this module |
| `controllers` | the set of controllers defined in this module which have to be instantiated                                        |
| `imports`     | the list of imported modules that declare the injectables which are required in this module                        |

[//]: # (| `exports`     | the subset of `injectables` that are provided by this module and should be available in other modules which import this module. You can use either the provider itself or just its token &#40;`provide` value&#41; |)

The module **does not encapsulate** injectables. This means that you can inject injectables from any module as long as it has been resolved.

This will change in the future.

### Feature modules

The `TodoController` and `TodoService` belong to the same application domain. As they are closely related, it makes sense to move them into a feature module. A feature module simply organizes code relevant for a specific feature, keeping code organized and establishing clear boundaries. This helps us manage complexity and develop with [SOLID](https://en.wikipedia.org/wiki/SOLID) principles, especially as the size of the application and/or team grow.

To demonstrate this, we'll create the `TodoModule`.

```ts todo.module.ts
import { Module } from 'https://deno.land/x/danet/mod.ts';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

@Module({
  controllers: [TodoController],
  injectables: [TodoService],
})
export class TodoModule {}
```

Above, we defined the `TodoModule` in the `todo.module.ts` file, and moved everything related to this module into the `todo` directory. The last thing we need to do is import this module into the root module (the `AppModule`, defined in the `app.module.ts` file).

```typescript
@@filename(app.module)
import { Module } from 'https://deno.land/x/danet/mod.ts';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [TodoModule],
})
export class AppModule {}
```

### Shared modules

In Danet, modules are **singletons** by default, and thus you can share the same instance of any provider between multiple modules effortlessly.

Every module is automatically a **shared module**. Once created it can be reused by any module. Let's imagine that we want to share an instance of the `TodoService` between several other modules. In order to do that, nothing has to be done, any module that imports the `TodoModule` has access to the `TodoService` and will share the same instance with all other modules that import it as well.

### Global modules

Like in [Angular](https://angular.io) `injectables` are registered in the global scope. Once defined, they're available everywhere.