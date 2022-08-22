---
  order: 98
---


Injectables are a fundamental concept in Danet. Many of the basic Danet classes may be treated as a provider – services, repositories, factories, helpers, and so on. The main idea of a provider is that it can be **injected** as a dependency; this means objects can create various relationships with each other, and the function of "wiring up" instances of objects can largely be delegated to the Danet runtime system.

![](https://docs.nestjs.com/assets/Components_1.png)
Image from [nestjs documentation](https://docs.nestjs.com/providers)

In the previous chapter, we built a simple `TodoController`. Controllers should handle HTTP requests and delegate more complex tasks to **injectables**. Injectables are plain JavaScript classes that are declared as `injectables` in a 

[!ref](/overview/modules.md).

> info **Hint** Since Danet enables the possibility to design and organize dependencies in a more OO way, we strongly recommend following the [SOLID](https://en.wikipedia.org/wiki/SOLID) principles.

### Services

Let's start by creating a simple `TodoService`. This service will be responsible for data storage and retrieval, and is designed to be used by the `TodoController`, so it's a good candidate to be defined as a provider.

```ts todo.service.ts
import { Injectable } from 'https://deno.land/x/danet/mod.ts';
import { Todo } from './todo.interface';

@Injectable()
export class TodoService {
  private readonly todos: Todo[] = [];

  create(todo: Todo) {
    this.todos.push(todo);
  }

  findAll(): Todo[] {
    return this.todos;
  }
}
```

Our `TodoService` is a basic class with one property and two methods. The only new feature is that it uses the `@Injectable()` decorator. The `@Injectable()` decorator attaches metadata, which declares that `TodoService`  is a class that can be managed by the Danet [IoC](https://en.wikipedia.org/wiki/Inversion_of_control) container. By the way, this example also uses a `Todo` interface, which probably looks something like this:

```ts todo.interface
export interface Todo {
  title: string;
  description: string;
}
```

Now that we have a service class to retrieve todos, let's use it inside the `TodoController`:

```ts todo.controller

import { Controller, Get, Post, Body } from 'https://deno.land/x/danet/mod.ts';
import { CreateTodoDto } from './create-todo.dto';
import { TodoService } from './todo.service';
import { Todo } from './todo.interface';

@Controller('todo')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto) {
    this.todoService.create(createTodoDto);
  }

  @Get()
  async findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
  }
}
```

The `TodoService` is **injected** through the class constructor. Notice the use of the `private` syntax. This shorthand allows us to both declare and initialize the `todoService` member immediately in the same location.

### Dependency injection

Danet is built around the strong design pattern commonly known as **Dependency injection**. We recommend reading a great article about this concept in the official [Angular](https://angular.io/guide/dependency-injection) documentation.

In Danet, thanks to TypeScript capabilities, it's extremely easy to manage dependencies because they are resolved just by type. In the example below, Danet will resolve the `todoService` by creating and returning an instance of `TodoService` (or, in the normal case of a singleton, returning the existing instance if it has already been requested elsewhere). This dependency is resolved and passed to your controller's constructor (or assigned to the indicated property):

```ts
constructor(private todoService: TodoService) {}
```

### Scopes

Injectables normally have a lifetime ("scope") synchronized with the application lifecycle. When the application is bootstrapped, every dependency must be resolved, and therefore every provider has to be instantiated. Similarly, when the application shuts down, each provider will be destroyed. However, there are ways to make your provider lifetime **request-scoped** as well. 
You can read more about these techniques on the following page[!fundamentals](/overview/injection-scopes.md)

[//]: # (### Custom injectables)

[//]: # ()
[//]: # (Danet has a built-in inversion of control &#40;"IoC"&#41; container that resolves relationships between injectables. This feature underlies the dependency injection feature described above, but is in fact far more powerful than what we've described so far. There are several ways to define a provider: you can use plain values, classes, and either asynchronous or synchronous factories. More examples are provided [here]&#40;/fundamentals/dependency-injection&#41;.)

### Provider registration

Now that we have defined a provider (`TodoService`), and we have a consumer of that service (`TodoController`), we need to register the service with Danet so that it can perform the injection. We do this by editing our module file (`app.module.ts`) and adding the service to the `injectables` array of the `@Module()` decorator.

```ts app.module
import { Module } from 'https://deno.land/x/danet/mod.ts';
import { TodoController } from './todo/todo.controller';
import { TodoService } from './todo/todo.service';

@Module({
  controllers: [TodoController],
  injectables: [TodoService],
})
export class AppModule {}
```

Danet will now be able to resolve the dependencies of the `TodoController` class.
