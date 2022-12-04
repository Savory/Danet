---
order: 98
label: Types and Parameters
---

### Body, Query and Params

The `SwaggerModule` searches for all `@Body()` and `@Query()` decorators in route handlers to generate the API document. It also creates corresponding model definitions by taking advantage of reflection. Consider the following code:

```ts
@Post()
async create(@Body() createTodoDto: CreateTodoDto) {
  this.todoService.create(createTodoDto);
}
```

!!!Hint
To explicitly set the body definition use the `@BodyType(Todo)` decorator.
To explicitly set the query definition use the `@QueryType(Todo)` decorator.
!!!

In order to make the class properties visible to the `SwaggerModule`, we have to annotate them with the `@ApiProperty()` decorator :

```ts
export class CreateTodoDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  priority!: number;

  @ApiProperty()
  colorLabel!: string;
}
```

!!!Hint
If one of these property is optional, you can use `@Optional()` decorator.
!!!

### Return type

Due to SWC (Deno's typescript compiler) lacking `design:return` metadata, you **must** use the `@ReturnedType` decorator to say what your endpoint will return :


```ts
@ReturnedType(Todo)
@Get(':id')
async getById(@Param('id') id: string): Todo {
  return this.todoService.getById(id);
}
```