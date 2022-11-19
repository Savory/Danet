---
order: 99
---

Controllers are responsible for handling incoming **requests** and returning
**responses** to the client.

A controller's purpose is to receive specific requests for the application. The
**routing** mechanism controls which controller receives which requests.
Frequently, each controller has more than one route, and different routes can
perform different actions.

In order to create a basic controller, we use classes and **decorators**.
Decorators associate classes with required metadata and enable Danet to create a
routing map (tie requests to the corresponding controllers).

### Routing

In the following example we'll use the `@Controller()` decorator, which is
**required** to define a basic controller. We'll specify an optional route path
prefix of `todo`. Using a path prefix in a `@Controller()` decorator allows us
to easily group a set of related routes, and minimize repetitive code. For
example, we may choose to group a set of routes that manage interactions with a
customer entity under the route `/customers`. In that case, we could specify the
path prefix `customers` in the `@Controller()` decorator so that we don't have
to repeat that portion of the path for each route in the file.

```ts todo.controller.ts
import { Controller, Get } from 'https://deno.land/x/danet/mod.ts';

@Controller('todo')
export class TodoController {
  @Get()
  findAll(): string {
    return 'This action returns all todo';
  }
}
```

The `@Get()` HTTP request method decorator before the `findAll()` method tells
Danet to create a handler for a specific endpoint for HTTP requests. The
endpoint corresponds to the HTTP request method (GET in this case) and the route
path. What is the route path? The route path for a handler is determined by
concatenating the (optional) prefix declared for the controller, and any path
specified in the method's decorator. Since we've declared a prefix for every
route ( `todo`), and haven't added any path information in the decorator, Danet
will map `GET /todo` requests to this handler. As mentioned, the path includes
both the optional controller path prefix **and** any path string declared in the
request method decorator. For example, a path prefix of `customers` combined
with the decorator `@Get('profile')` would produce a route mapping for requests
like `GET /customers/profile`.

In our example above, when a GET request is made to this endpoint, Danet routes
the request to our user-defined `findAll()` method. Note that the method name we
choose here is completely arbitrary. We obviously must declare a method to bind
the route to, but Danet doesn't attach any significance to the method name
chosen.

This method will return a 200 status code and the associated response, which in
this case is just a string.

### Request object

Handlers often need access to the client **request** details. Danet provides
access to the
[request object](https://doc.deno.land/https://deno.land/x/oak@v10.6.0/mod.ts/~/Request).
We can access the request object by instructing Danet to inject it by adding the
`@Req()` decorator to the handler's signature.

```ts todo.controller.ts
import { Controller, Get, Req } from 'https://deno.land/x/danet/mod.ts';

@Controller('todo')
export class TodoController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all todo';
  }
}
```

The request object represents the HTTP request and has properties for the
request query string, parameters, HTTP headers, and body. In most cases, it's
not necessary to grab these properties manually. We can use dedicated decorators
instead, such as `@Body()` or `@Query()`, which are available out of the box.
Below is a list of the provided decorators and the plain platform-specific
objects they represent.

| Decorator | Type | Value |
|-----------|------|-------|
| `@Req()` | [oak.Request](https://deno.land/x/oak@v10.5.1/request.ts) | `ctx.request` |
| `@Res()` | [oak.Response](https://deno.land/x/oak@v10.5.1/response.ts) | `ctx.response` |
| `@Param(key: string)` | `string` | `context.params[key]` |
| `@Header(key? : string)` | `string \| undefined` | `ctx.request.headers` / `ctx.request.headers.get(key)` |
| `@Body(key?: string)` | `any` | `ctx.request.body` / `ctx.request.body[key]` |
| `@Query(key: string, options?: { value?: 'first' \| 'last' \| 'array' })` | `string \| string[]` | Get the `first`, the `last` or `all` the values for the query parameter named `key` |
| `@Query(options?: { value?: 'first' \| 'last' \| 'array' })` | `{ [key: string]: string \| string[] }` | Get the `first`, the `last` or `all` the values for all the query parameters |

### Resources

Earlier, we defined an endpoint to fetch the todo resource (**GET** route).
We'll typically also want to provide an endpoint that creates new records. For
this, let's create the **POST** handler:

```ts todo.controller.ts
import { Controller, Get, Post } from 'https://deno.land/x/danet/mod.ts';

@Controller('todo')
export class TodoController {
  @Post()
  create(): string {
    return 'This action adds a new todo';
  }

  @Get()
  findAll(): string {
    return 'This action returns all todo';
  }
}
```

It's that simple. Danet provides decorators for almost all of the standard HTTP
methods: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`. In addition,
`@All()` defines an endpoint that handles all of them.

### Route parameters

Routes with static paths won't work when you need to accept **dynamic data** as
part of the request (e.g., `GET /todo/1` to get todo with id `1`). In order to
define routes with parameters, we can add route parameter **tokens** in the path
of the route to capture the dynamic value at that position in the request URL.
The route parameter token in the `@Get()` decorator example below demonstrates
this usage. Route parameters declared in this way can be accessed using the
`@Param()` decorator, which should be added to the method signature.

```ts
@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} todo`;
}
```

`@Param()` is used to decorate a method parameter by giving a particular
parameter token to the decorator.

!!!info Hint
Import `Param` from the `https://deno.land/x/danet/mod.ts` package.
!!!

### Scopes

For people coming from different programming language backgrounds, it might be
unexpected to learn that in Danet, almost everything is shared across incoming
requests. We have a connection pool to the database, singleton services with
global state, etc.

However, there are edge-cases when request-based lifetime of the controller may
be the desired behavior, for example request tracking or multi-tenancy.
Documentation page will be created to explain how to do that.

### Asynchronicity

Being a modern framework, we know that data extraction is mostly
**asynchronous**. That's why Danet supports and works well with `async`
functions.

!!!info Hint
Learn more about `async / await` feature [here](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await)
!!!

Every async function has to return a `Promise`. This means that you can return a
deferred value that Danet will be able to resolve by itself. Let's see an
example of this:

```ts todo.controller.ts
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```

### Request payloads

Our previous examples of the POST route handler didn't accept any client params.
Let's fix this by adding the `@Body()` decorator here.

But first, we need to determine the DTO (Data Transfer
Object) schema. A DTO is an object that defines how the data will be sent over
the network. We determine the DTO schema by using simples classes with **Type validation decorators**.
Danet uses [Validatte](https://github.com/Savory/validatte) to validate the Dto Schema with
the body received. So, for each member of body you'll need to use a matching decorator for it.

You can see all the validation decorators avaibles [here](https://github.com/Savory/validatte#available-decorators).

Let's create the CreateTodoDto class:

```ts create-todo.dto.ts
import { IsNumber, IsString, IsHexColor } from 'https://deno.land/x/validatte/mod.ts';

export class CreateTodoDto {
  @IsString()
  name!: string;

  @IsNumber()
  priority!: number;

  @IsHexColor()
  colorLabel!: string;
}
```

It has only three basic properties. Thereafter we can use the newly created DTO
inside the TodoController:

```ts todo.controller.ts
@Post()
async create(@Body() createTodoDto: CreateTodoDto) {
  return 'This action adds a new todo';
}
```

If the body doesn't follow the DTO is returned a 400 status code. Like the example below:

```json
{
	"status": 400,
	"name": "NotValidBodyException",
	"reasons": [
		{
			"property": "priority",
			"errorMessage": "Property must be a number",
			"constraints": []
		}
	],
	"message": "400 - Body bad formatted"
}
```

!!!info Hint
More details about Body validation can be found [here](https://savory.github.io/body-validation-in-danet/).
!!!

### Handling errors

There's a separate chapter about handling errors (i.e., working with
exceptions): [!ref](exception-filters.md)

### Full resource sample

Below is an example that makes use of several of the available decorators to
create a basic controller. This controller exposes a couple of methods to access
and manipulate internal data.

```ts todo.controller.ts
import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from 'https://deno.land/x/danet/mod.ts';
import { CreateTodoDto, UpdateTodoDto, ListAllEntities } from './dto';

@Controller('todo')
export class TodoController {
  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return 'This action adds a new todo';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} todo`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return `This action updates a #${id} todo`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} todo`;
  }
}
```

### Getting up and running

With the above controller fully defined, Danet still doesn't know that
`TodoController` exists and as a result won't create an instance of this class.

Controllers always belong to a module, which is why we include the `controllers`
array within the `@Module()` decorator. Since we haven't yet defined any other
modules except the root `AppModule`, we'll use that to introduce the
`TodoController`:

```ts app.module.ts
import { Module } from 'https://deno.land/x/danet/mod.ts';
import { TodoController } from './todo/todo.controller';

@Module({
  controllers: [TodoController],
})
export class AppModule {}
```

We attached the metadata to the module class using the `@Module()` decorator,
and Danet can now easily reflect which controllers have to be mounted.

Now, it is time to create a DanetApplication that bootstrap our AppModule.

We advise you to create a bootstrap function that returns your DanetApplication instance, this will make testing easier as you can get your application instance and make it listen to a random port.

```ts bootstrap.ts
import { AppModule } from './app.module.ts';
import { DanetApplication } from 'https://deno.land/x/danet/mod.ts';

export const bootstrap = async () => {
  const application = new DanetApplication();
  await application.init(AppModule);
  return application;
}
```

Run this function to get an application instance, and call `listen` method to run the server.

```ts run.ts
import { bootstrap } from './bootstrap.ts';

const application = await bootstrap();
await application.listen(Number(Deno.env.get('PORT') || 3000));
```

And finally execute this file with `deno run --allow-net --unstable --allow-env run.ts`
