---
order: 96
---

Middleware is a function which is called **before** the route handler. Middleware functions have access to [oak's context](https://deno.land/x/oak@v11.1.0/context.ts?s=Context) object.

<figure><img src="https://docs.nestjs.com/assets/Middlewares_1.png" /></figure>

<blockquote class="external">
  Middleware functions can perform the following tasks:
  <ul>
    <li>execute any code.</li>
    <li>make changes to the context object.</li>
  </ul>
</blockquote>

You implement custom Danet middleware in either a function, or in a class with an `@Injectable()` decorator. The class should implement the `DanetMiddleware` interface, while the function does not have any special requirements. Let's start by implementing a simple middleware feature using the class method.

```ts logger.middleware.ts
import { Injectable, DanetMiddle, HttpContext, NextFunction } from 'https://deno.land/x/danet/mod.ts';

@Injectable()
export class LoggerMiddleware implements DanetMiddleware {
  async action(ctx: HttpContext, next: NextFunction) {
    console.log('Request...');
    await next();
  }
}
```

#### Dependency injection

Danet middleware fully supports Dependency Injection. Just as with injectables and controllers, they are able to **inject dependencies** that are available within the same module. As usual, this is done through the `constructor`.

#### Applying middleware

You can apply middlewares either globally, to controllers and to methods.

For global middlewares simply use `addGlobalMiddlewares` DanetApplication's method as following:

```ts bootstrap.ts
...
  const application = new DanetApplication();
  await application.init(AppModule);
  application.addGlobalMiddlewares(LoggerMiddleware); //as many middleware as you want;
...
```

For controllers and methods, simply use `@Middleware` decorator ! Like `addGlobalMiddlewares`, it can take as many middleware are you need for arguments.

```ts todo.controllers.ts
@Middleware(LoggerMiddleware)
@Controller('todo')
class TodoController {
	@Get('/')
	getWithMiddleware() {
    return 'OK'
    }
};
```

#### Functional middleware

The `LoggerMiddleware` class we've been using is quite simple. It has no members, no additional methods, and no dependencies. Why can't we just define it in a simple function instead of a class? In fact, we can. This type of middleware is called **functional middleware**. Let's transform the logger middleware from class-based into functional middleware to illustrate the difference:

```ts logger.middleware.ts
import { Injectable, DanetMiddle, HttpContext, NextFunction } from 'https://deno.land/x/danet/mod.ts';

export async function logger(ctx: HttpContext, next: NextFunction) {
  console.log(`Request...`);
  await next();
};
```

And use it within the `TodoController`:

```ts todo.controller.ts
@Middleware(logger)
@Controller('todo')
class TodoController {
  @Get('/')
  getWithMiddleware() {
    return 'OK'
  }
};
```

!!!info **Hint**
Consider using the simpler **functional middleware** alternative any time your middleware doesn't need any dependencies.
!!!

#### Multiple middleware

As mentioned above, in order to bind multiple middleware that are executed sequentially, simply provide them in left to right order to `@Middleware` or `addGlobalMiddleware`.

#### Global middleware

If we want to bind middleware to every registered route at once, simply use `addGlobalMiddlewares` DanetApplication's method as following:

```ts bootstrap.ts
...
  const application = new DanetApplication();
  await application.init(AppModule);
  application.addGlobalMiddlewares(YourFirstMiddleware, SecondMiddleware); //as many middleware as you want;
...
```