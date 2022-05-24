Controllers are responsible for handling incoming **requests** and returning **responses** to the client.

A controller's purpose is to receive specific requests for the application. The **routing** mechanism controls which controller receives which requests. Frequently, each controller has more than one route, and different routes can perform different actions.

In order to create a basic controller, we use classes and **decorators**. Decorators associate classes with required metadata and enable Danet to create a routing map (tie requests to the corresponding controllers).

### Routing

In the following example we'll use the `@Controller()` decorator, which is **required** to define a basic controller. We'll specify an optional route path prefix of `cats`. Using a path prefix in a `@Controller()` decorator allows us to easily group a set of related routes, and minimize repetitive code. For example, we may choose to group a set of routes that manage interactions with a customer entity under the route `/customers`. In that case, we could specify the path prefix `customers` in the `@Controller()` decorator so that we don't have to repeat that portion of the path for each route in the file.

```ts cats.controller.ts
import { Controller, Get } from 'https://deno.land/x/danet/mod.ts';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

The `@Get()` HTTP request method decorator before the `findAll()` method tells Danet to create a handler for a specific endpoint for HTTP requests. The endpoint corresponds to the HTTP request method (GET in this case) and the route path. What is the route path? The route path for a handler is determined by concatenating the (optional) prefix declared for the controller, and any path specified in the method's decorator. Since we've declared a prefix for every route ( `cats`), and haven't added any path information in the decorator, Danet will map `GET /cats` requests to this handler. As mentioned, the path includes both the optional controller path prefix **and** any path string declared in the request method decorator. For example, a path prefix of `customers` combined with the decorator `@Get('profile')` would produce a route mapping for requests like `GET /customers/profile`.

In our example above, when a GET request is made to this endpoint, Danet routes the request to our user-defined `findAll()` method. Note that the method name we choose here is completely arbitrary. We obviously must declare a method to bind the route to, but Danet doesn't attach any significance to the method name chosen.

This method will return a 200 status code and the associated response, which in this case is just a string.

### Request object

Handlers often need access to the client **request** details. Danet provides access to the [request object](https://doc.deno.land/https://deno.land/x/oak@v10.6.0/mod.ts/~/Request). We can access the request object by instructing Danet to inject it by adding the `@Req()` decorator to the handler's signature.

```ts cats.controller.ts
import { Controller, Get, Req } from 'https://deno.land/x/danet/mod.ts';

@Controller('cats')
export class CatsController {
  @Get()
  findAll(@Req() request: Request): string {
    return 'This action returns all cats';
  }
}
```


The request object represents the HTTP request and has properties for the request query string, parameters, HTTP headers, and body. In most cases, it's not necessary to grab these properties manually. We can use dedicated decorators instead, such as `@Body()` or `@Query()`, which are available out of the box. Below is a list of the provided decorators and the plain platform-specific objects they represent.

<table>
  <tbody>
    <tr>
      <td><code>@Req()</code></td>
      <td><code>ctx.request</code></td></tr>
    <tr>
      <td><code>@Res()</code><span class="table-code-asterisk">*</span></td>
      <td><code>ctx.response</code></td>
    </tr>
    <tr>
      <td><code>@Param(key: string)</code></td>
      <td><code>getQuery(context, { mergeParams: true })[key]</code></td>
    </tr>
    <tr>
      <td><code>@Body(key?: string)</code></td>
      <td><code>ctx.request.body</code> / <code>ctx.request.body[key]</code></td>
    </tr>
    <tr>
      <td><code>@Query(key: string)</code></td>
      <td><code>getQuery(context, { mergeParams: true })[key]</code></td>
    </tr>
  </tbody>
</table>

### Resources

Earlier, we defined an endpoint to fetch the cats resource (**GET** route). We'll typically also want to provide an endpoint that creates new records. For this, let's create the **POST** handler:

```ts cats.controller.ts
import { Controller, Get, Post } from 'https://deno.land/x/danet/mod.ts';

@Controller('cats')
export class CatsController {
  @Post()
  create(): string {
    return 'This action adds a new cat';
  }

  @Get()
  findAll(): string {
    return 'This action returns all cats';
  }
}
```

It's that simple. Danet provides decorators for almost all of the standard HTTP methods: `@Get()`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`. In addition, `@All()` defines an endpoint that handles all of them.

### Route parameters

Routes with static paths won't work when you need to accept **dynamic data** as part of the request (e.g., `GET /cats/1` to get cat with id `1`). In order to define routes with parameters, we can add route parameter **tokens** in the path of the route to capture the dynamic value at that position in the request URL. The route parameter token in the `@Get()` decorator example below demonstrates this usage. Route parameters declared in this way can be accessed using the `@Param()` decorator, which should be added to the method signature.

```ts
@Get(':id')
findOne(@Param('id') id: string): string {
  return `This action returns a #${id} cat`;
}
```

`@Param()` is used to decorate a method parameter by giving a particular parameter token to the decorator.

!!!info Hint 
Import `Param` from the `https://deno.land/x/danet/mod.ts` package.
!!!

### Scopes

For people coming from different programming language backgrounds, it might be unexpected to learn that in Danet, almost everything is shared across incoming requests. We have a connection pool to the database, singleton services with global state, etc.

However, there are edge-cases when request-based lifetime of the controller may be the desired behavior, for example request tracking or multi-tenancy. Documentation page will be created to explain how to do that.

### Asynchronicity

Being a modern framework, we know that data extraction is mostly **asynchronous**. That's why Danet supports and works well with `async` functions.

!!!info Hint
Learn more about `async / await` feature [here](https://kamilmysliwiec.com/typescript-2-1-introduction-async-await)
!!!

Every async function has to return a `Promise`. This means that you can return a deferred value that Danet will be able to resolve by itself. Let's see an example of this:

```ts cats.controller.ts
@Get()
async findAll(): Promise<any[]> {
  return [];
}
```
### Handling errors

There's a separate chapter about handling errors (i.e., working with exceptions):
[!ref](exception-filters.md)
### Full resource sample

Below is an example that makes use of several of the available decorators to create a basic controller. This controller exposes a couple of methods to access and manipulate internal data.

```ts cats.controller.ts
import { Controller, Get, Query, Post, Body, Put, Param, Delete } from 'https://deno.land/x/danet/mod.ts';
import { CreateCatDto, UpdateCatDto, ListAllEntities } from './dto';

@Controller('cats')
export class CatsController {
  @Post()
  create(@Body() createCatDto: CreateCatDto) {
    return 'This action adds a new cat';
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return `This action returns a #${id} cat`;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
    return `This action updates a #${id} cat`;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return `This action removes a #${id} cat`;
  }
}
```

### Getting up and running

With the above controller fully defined, Danet still doesn't know that `CatsController` exists and as a result won't create an instance of this class.

Controllers always belong to a module, which is why we include the `controllers` array within the `@Module()` decorator. Since we haven't yet defined any other modules except the root `AppModule`, we'll use that to introduce the `CatsController`:

```ts app.module.ts
import { Module } from 'https://deno.land/x/danet/mod.ts';
import { CatsController } from './cats/cats.controller';

@Module({
  controllers: [CatsController],
})
export class AppModule {}
```

We attached the metadata to the module class using the `@Module()` decorator, and Danet can now easily reflect which controllers have to be mounted.
