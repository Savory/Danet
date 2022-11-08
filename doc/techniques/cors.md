---
label: CORS
order: 60
---

**Cross-origin resource sharing (CORS)** is a mechanism that allows resources to be requested from another domain.

### Usage

As Danet uses Oak under the hood, you can use [oak_cors](https://deno.land/x/oak_cors) package.

Then, apply its middleware as global middleware (for example, in your `bootstrap.ts` file).

```typescript
import { CORS } from "https://deno.land/x/oak_cors/mod.ts";

const app = new DanetApplication();
app.addGlobalMiddlewares(CORS() as MiddlewareFunction);
```
!!!hint **Hint**
Feel free to use any other cors middleware you like
!!!
