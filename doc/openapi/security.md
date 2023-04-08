---
order: 97
label: Security
---

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

### Basic authentication

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



### Bearer authentication

To enable bearer authentication, use `@ApiBearerAuth()`.

```typescript
@ApiBearerAuth()
@Controller('todo')
export class TodoController {}
```

Before you run your application, remember to add the security definition to your base document using `SpecBuilder`:

```typescript
const options = new SpecBuilder().addBearerAuth();
```

### OAuth2 authentication

To enable OAuth2, use `@ApiOAuth2()`.

```typescript
@ApiOAuth2(['todos:write'])
@Controller('todo')
export class TodoController {}
```

Before you run your application, remember to add the security definition to your base document using `SpecBuilder`:

```typescript
const options = new SpecBuilder().addOAuth2();
```

### Cookie authentication

To enable cookie authentication, use `@ApiCookieAuth()`.

```typescript
@ApiCookieAuth()
@Controller('todo')
export class TodoController {}
```

Before you run your application, remember to add the security definition to your base document using `SpecBuilder`:

```typescript
const options = new SpecBuilder().addCookieAuth('token');
```