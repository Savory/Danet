---
order: 98
label: Types and Parameters
---

!!!danger
The SwaggerModule is currently in Alpha, maaaany features are missing. If something you need is not here yet, [please fill an issue/feature request](https://github.com/Savory/Danet-Swagger/issues)
!!!


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

Based on the `Todo`, the following model definition Swagger UI will be created:
![image](https://user-images.githubusercontent.com/38007824/206904581-a7d39867-4a1b-40d2-be39-60e65897d99e.png)


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

Let's open the browser and verify the generated `Todo` model:

![image](https://user-images.githubusercontent.com/38007824/206904638-1f44ef08-c8e1-4d95-b605-8acc80227397.png)

### Return type

Due to SWC (Deno's typescript compiler) lacking `design:return` metadata, you **must** use the `@ReturnedType` decorator to say what your endpoint will return :


```ts
@ReturnedType(Todo)
@Get(':id')
async getById(@Param('id') id: string): Todo {
  return this.todoService.getById(id);
}
```

If your route returns an array, pass `true` as the second argument of `ReturnedType` : 


```ts
@ReturnedType(Todo, true)
@Get()
async getTodos(): Todo[] {
  return this.todoService.getAll();
}
```

### Enums

To identify an `enum`, we must manually set the `enum` property on the `@ApiProperty` with an array of values.

```ts
@ApiProperty({ enum: ['Admin', 'Moderator', 'User']})
role: UserRole;
```