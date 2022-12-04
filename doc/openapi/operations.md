---
order: 97
---


In OpenAPI terms, paths are endpoints (resources), such as `/users` or `/reports/summary`, that your API exposes, and operations are the HTTP methods used to manipulate these paths, such as `GET`, `POST` or `DELETE`.


!!!danger
The SwaggerModule is currently in Alpha, maaaany features are missing. If something you need is not here yet, [please fill an issue/feature request](https://github.com/Savory/Danet-Swagger/issues)
!!!


#### Tags

To attach a **controller or an endpoint** to a specific tag, use the `@Tag(tagName)` decorator.

```typescript
@Tag('cats')
@Controller('todo')
export class TodoController {
  @Tag('get')
  @Get(':id')
  async getById(@Param('id') id: string): Todo {
    return this.todoService.getById(id);
  }
}
``````