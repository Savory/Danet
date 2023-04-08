
`ExecutionContext` provides additional details about the current execution process. Danet provides an instance of `ExecutionContext` in places you may need it, such as in the `canActivate()` method of a [guard](https://savory.github.io/Danet/overview/guards/) and the `action()` method of a [middleware](https://savory.github.io/Danet/overview/middlewares/). It provides the following methods:

```ts
type ExecutionContext = {
  /**
   * Returns the type of the controller class which the current handler belongs to.
   */
  getClass(): Constructor;
  /**
   * Returns a reference to the handler (method) that will be invoked next in the
   * request pipeline.
   */
  getHandler(): Function;
}
```

The `getHandler()` method returns a reference to the handler about to be invoked. The `getClass()` method returns the type of the `Controller` class which this particular handler belongs to. For example, if the currently processed request is a `POST` request, bound to the `create()` method on the `TodoController`, `getHandler()` returns a reference to the `create()` method and `getClass()` returns the `TodoController` **type** (not instance).

```typescript
const methodKey = ctx.getHandler().name; // "create"
const className = ctx.getClass().name; // "TodoController"
```

The ability to access references to both the current class and handler method provides great flexibility. Most importantly, it gives us the opportunity to access the metadata set through the `@SetMetadata()` decorator from within guards or interceptors. We cover this use case below.

#### Reflection and metadata

Danet provides the ability to attach **custom metadata** to route handlers through the `@SetMetadata()` decorator. We can then access this metadata from within our class to make certain decisions.

```ts todo.controller.ts
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createTodoDto: CreateTodoDto) {
  this.todoService.create(createCatDto);
}

```

With the construction above, we attached the `roles` metadata (`roles` is a metadata key and `['admin']` is the associated value) to the `create()` method. While this works, it's not good practice to use `@SetMetadata()` directly in your routes. Instead, create your own decorators, as shown below:

```typescript roles.decorators.ts
import { SetMetadata } from 'https://deno.land/x/danet/mod.ts';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

This approach is much cleaner and more readable, and is strongly typed. Now that we have a custom `@Roles()` decorator, we can use it to decorate the `create()` method.

```typescript todo.controller.ts
@Post()
@Roles('admin')
async create(@Body() createTodoDto: CreateTodoDto) {
    this.todoService.create(createCatDto);
}
```

To access the route's role(s) (custom metadata), we'll use the `MetadataHelper` static methods, 

To read the handler metadata, use the `get()` method.

```typescript
const roles = MetadataHelper.getMetadata<string[]>('roles', context.getHandler());
```

The `MetadataHelper#getMetadata` method allows us to easily access the metadata by passing in two arguments: a metadata **key** and a **context** (decorator target) to retrieve the metadata from. In this example, the specified **key** is `'roles'` (refer back to the `roles.decorator.ts` file above and the `SetMetadata()` call made there). The context is provided by the call to `context.getHandler()`, which results in extracting the metadata for the currently processed route handler. Remember, `getHandler()` gives us a **reference** to the route handler function.

Alternatively, we may organize our controller by applying metadata at the controller level, applying to all routes in the controller class.

```typescript todo.controller.ts
@Roles('admin')
@Controller('todo')
export class TodoController {}
```

In this case, to extract controller metadata, we pass `context.getClass()` as the second argument (to provide the controller class as the context for metadata extraction) instead of `context.getHandler()`:

```typescript roles.guard.ts
const roles = MetadataHelper.getMetadata<string[]>('roles', context.getClass());
```