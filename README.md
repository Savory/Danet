<h1 align="center">Danet</h1>
<p align="center">A web framework heavily inspired by Nest.</p>


[![Run tests](https://github.com/Sorikairox/Danet/actions/workflows/run-tests.yml/badge.svg)](https://github.com/Sorikairox/Danet/actions/workflows/run-tests.yml)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![codecov](https://codecov.io/gh/Sorikairox/Danet/branch/main/graph/badge.svg?token=R6WXVC669Z)](https://codecov.io/gh/Sorikairox/Danet)
## Goals

| Goal                                                              | State        |
|-------------------------------------------------------------------|--------------|
| Controllers and routes creation with Decorators (GET, PUT, DELETE, POST, PATCH) | Complete ✅   |
| Module with dependency injection                                  | Complete ✅   |
| Request, Response and Body injection in Routes via decorators     | Complete ✅   |
| Route parameter decorator factory to easily create param decorators (even async) | Complete ✅   |
| Url params injection in Controllers with Decorators               | Complete ✅   |
| Guards implementations for controllers and methods                | Complete ✅   |
| Global guard                                                      | Complete ✅   |
| Create documentation                                              | In progress ⌛ |
| Logger                                                            | Waiting      |
| Handle OPTIONS and HEAD                                           | Waiting      |
| Anything we have in mind                                          | Waiting      |


## How to use

If you are familiar with Nest (and if you're not, [go check it out](https://nestjs.com/)), you will not be lost.

In this simplified example, we are building a todo-app: 

### Modules

```Typescript
@Module({
  controllers: [TodoController],
  injectables: [TodoService]
})
class TodoModule {}
```


### Controllers

```Typescript
@Controller('todo')
class TodoController {
  //todoService will be automatically injected at runtime with DI
  constructor(private todoService: TodoService) {
  }

  @Get('')
  getTodos() {
    return this.todoService.getTodos();
  }

  @Get(':id')
  getOneTodo(@Param('id') todoId: string) {
    return this.todoService.getOne(todoId);
  }

  @Post('')
  createTodo(@Body() todo) {
    return this.todoService.createTodo(todo);
  }

  @Put('')
  UpdateTodos(@Body() updatedTodos: Todo[]) {
    return this.todoService.updateMany(updatedTodos);
  }

  @Put(':id')
  UpdateOneTodo(@Param('id') todoId: string, @Body() updatedTodo: Todo) {
    return this.todoService.updateOneById(todoId, updatedTodo);
  }
}
```


### Services

```Typescript
//By default, injectables are singleton
@Injectable()
class TodoService {

  //create  your own DatabaseService to interact with db, it will  be injected
  constructor(databaseService: DatabaseService) {
  }

  getTodos() {
    this.databaseService.getMany();
  }
  // implement yours logic
}
```


### Run your app

```Typescript
const optionalPort = 4000; 
const app = new DanetApplication();
app.bootstrap(TodoModule);
await app.listen(optionalPort); //default to 3000
```
