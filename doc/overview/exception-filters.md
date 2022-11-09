---
order: 95
---


Danet comes with a built-in **exceptions layer** which is responsible for
processing all unhandled exceptions across an application. When an exception is
not handled by your application code, it is caught by this layer, which then
automatically sends an appropriate user-friendly response.

Out of the box, this action is performed by a built-in **global exception
filter**, which handles all exceptions. When an exception is **unrecognized**
(does not have `statusCode` and `message` properties), the built-in exception
filter generates the following default JSON response:

```json
{
  "statusCode": 500,
  "message": "Internal server error!"
}
```

!!!info **Hint**
Any thrown exception containing the `statusCode` and `message`
property will be properly populated and send back as a response (instead of the
default `InternalServerError` for unrecognized exceptions).
!!!

#### Built-in HTTP exceptions

Danet provides a set of standard exceptions that inherit from the base
`HttpException` and represent many of the most common HTTP exceptions:

- `BadRequestException`
- `UnauthorizedException`
- `NotFoundException`
- `ForbiddenException`
- `NotAcceptableException`
- `RequestTimeoutException`
- `ConflictException`
- `GoneException`
- `HttpVersionNotSupportedException`
- `PayloadTooLargeException`
- `UnsupportedMediaTypeException`
- `UnprocessableEntityException`
- `InternalServerErrorException`
- `NotImplementedException`
- `ImATeapotException`
- `MethodNotAllowedException`
- `BadGatewayException`
- `ServiceUnavailableException`
- `GatewayTimeoutException`
- `PreconditionFailedException`

### Exception filters

While the base (built-in) exception filter can automatically handle many cases
for you, you may want **full control** over the exceptions layer. For example,
you may want to add logging or use a different JSON schema based on some dynamic
factors. **Exception filters** are designed for exactly this purpose. They let
you control the exact flow of control and the content of the response sent back
to the client.

Let's create an exception filter that is responsible for catching exceptions
which are an instance of the `CustomException` class, and implementing custom
response logic for them.

```ts custom-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  HttpContext,
} from 'https://deno.land/x/danet/mod.ts';

@Injectable()
@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, ctx: HttpContext) {
    const response = ctx.response;
    const request = ctx.request;
    const status = exception.status;

    response.status = status;
    response.body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }
}
```

The `@Catch(CustomException)` decorator binds the required metadata to the
exception filter, telling Danet that this particular filter is looking for
exceptions of type `CustomException` and nothing else. The `@Catch()` decorator
takes a single parameter.

### Binding filters

Let's tie our new `CustomExceptionFilter` to the `TodoController`'s `create()`
method.

```ts cats.controller.ts
@Post()
@UseFilter(CustomerExceptionFilter)
async create(@Body() createTodoDto: CreateTodoDto) {
  throw new ForbiddenException();
}
```

We have used the `@UseFilters()` decorator here. Similar to the `@Catch()`
decorator, it takes the class of your filter, leaving responsibility for
instantiation to the framework, and enabling **dependency injection**.

In the example above, the `CustomException` is applied only to the single
`create()` route handler, making it method-scoped. Exception filters can be
scoped at different levels: method-scoped, controller-scoped, or global-scoped.
For example, to set up a filter as controller-scoped, you would do the
following:

```ts cats.controller.ts
@UseFilter(CustomExceptionFilter)
export class TodoController {}
```

This construction sets up the `CustomException` for every route handler defined
inside the `TodoController`.

### Catch everything

In order to catch **every** unhandled exception (regardless of the exception
type), omit `@Catch()` decorator.

```typescript
import {
  Catch,
  ExceptionFilter,
  HttpContext,
} from 'https://deno.land/x/danet/mod.ts';

@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: unknown, ctx: HttpContext): boolean {
    const response = ctx.response;
    const request = ctx.request;
    const status = exception.status;

    response.status = status;
    response.body = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    };
  }
}
```
