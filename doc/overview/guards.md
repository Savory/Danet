---
order: 90
---

A guard is a class annotated with the `@Injectable()` decorator, which implements the `AuthGuard` interface.

Guards have a **single responsibility**. They determine whether a given request will be handled by the route handler or not, depending on certain conditions (like permissions, roles, ACLs, etc.) present at run-time. This is often referred to as **authorization**.

### Authorization guard

As mentioned, **authorization** is a great use case for Guards because specific routes should be available only when the caller (usually a specific authenticated user) has sufficient permissions. The `AuthGuard` that we'll build now assumes an authenticated user (and that, therefore, a token is attached to the request headers). It will extract and validate the token, and use the extracted information to determine whether the request can proceed or not.

```typescript simple-auth-guard.ts

import { Injectable, AuthGuard } from 'https://deno.land/x/danet/mod.ts';
import { ExecutionContext } from "./router.ts";

@Injectable()
export class SimpleAuthGuard implements AuthGuard {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> {
        const request = context.request;
        return validateRequest(request);
    }
}
```

The logic inside the `validateRequest()` function can be as simple or sophisticated as needed. The main point of this example is to show how guards fit into the request/response cycle.

Every guard must implement a `canActivate()` function. This function should return a boolean, indicating whether the current request is allowed or not. It can return the response either synchronously or asynchronously via a `Promise`. Danet uses the return value to control the next action:

- if it returns `true`, the request will be processed.
- if it returns `false`, Danet will deny the request.

### Binding guards

Like pipes and exception filters, guards can be **controller-scoped**, method-scoped, or global-scoped. Below, we set up a controller-scoped guard using the `@UseGuards()` decorator. This decorator may take a single argument, or a comma-separated list of arguments. This lets you easily apply the appropriate set of guards with one declaration.

```typescript todo.controller.ts
@Controller('todo')
@UseGuards(SimpleGuard)
export class TodoController {}
```

The construction above attaches the guard to every handler declared by this controller. If we wish the guard to apply only to a single method, we apply the `@UseGuards()` decorator at the **method level**.

Global guards are used across the whole application, for every controller and every route handler. You can set up a global guard using the following:

```typescript app.module.ts
import { Module, AuthGuard } from 'https://deno.land/x/danet/mod.ts';

@Module({
  providers: [
    new TokenInjector(SimpleGuard, GLOBAL_GUARD)
  ],
})
export class AppModule {}
```
