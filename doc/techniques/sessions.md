---
label: Sessions
order: 50
---

**HTTP sessions** provide a way to store information about the user across multiple requests.

### Usage

As Danet uses Oak under the hood, you can use [oak_sessions](https://deno.land/x/oak_sessions) package.

Then, apply the `oak_sessions` middleware as global middleware (for example, in your `bootstrap.ts` file).

```typescript
import { Session } from 'https://deno.land/x/oak_sessions@v4.0.5/mod.ts';

const app = new DanetApplication();
app.addGlobalMiddlewares(
  Session.initMiddleware(),
);
```
!!!warning **Notice**
The default server-side session storage is purposely not designed for a production environment. It is meant for debugging and developing. Read more in the [official repository](https://deno.land/x/oak_sessions).
!!!

### With cookies

Oak_session use `Stores` to store session data in Cookies, Sqlite, Mongodb or Postgres.
The simpliest way to handle sessions is with cookies using `CookieStore`: 


```typescript
import {
  CookieStore,
  Session,
} from 'https://deno.land/x/oak_sessions@v4.0.5/mod.ts';

const app = new DanetApplication();
app.addGlobalMiddlewares(
  Session.initMiddleware(
    new CookieStore(Deno.env.get('COOKIE_SECRET_KEY') as string),
  ) as MiddlewareFunction,
);
```

### Session decorator

You can access the session in your routes using `@Session` decorator.
`oak_session`'s `Session` is basically a map, so we use the `Map` type.

```ts
import { Session,
} from 'https://deno.land/x/Danet/mod.ts';

@Get()
findAll(@Session() session: Map<unknown, unknown>) {
  const visits = session.get('visits');
  session.set('visits', visits ? visits + 1 : 1);
}
```