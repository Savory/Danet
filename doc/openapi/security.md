---
order: 97
label: Security
---

### Security

To define which security mechanisms should be used for a specific operation, use the `@ApiSecurity()` decorator.

```ts
@ApiSecurity('basic')
@Controller('todo')
export class TodoController {}
```

Before you run your application, remember to add the security definition to your base document using `SpecBuilder`:

```ts
const options = new Spec().addSecurity('basic', {
  type: 'http',
  scheme: 'basic',
});
```

Some of the most popular authentication techniques are built-in (e.g., `basic` and `bearer`) and therefore you don't have to define security mechanisms manually as shown above.

#### Basic authentication

To enable basic authentication, use `@ApiBasicAuth()`.

```ts
@ApiBasicAuth()
@Controller('todo')
export class TodoController {}
```

Add the security definition to your base document using `SpecBuilder`:

```ts
const options = new SpecBuilder().addBasicAuth();
```
