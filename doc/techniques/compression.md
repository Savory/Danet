---
label: Compression
order: 30
---

Compression can greatly decrease the size of the response body, thereby increasing the speed of a web app.

For high-traffic websites in production, it is strongly recommended to offload compression from the application server - typically in a reverse proxy (e.g., Nginx). In that case, you should not use compression middleware.


### Usage

As Danet uses Oak under the hood, you can use [oak_compress](https://deno.land/x/oak_compress) package.

Then, apply its middleware as global middleware (for example, in your `bootstrap.ts` file).

```typescript
import { brotli } from "https://deno.land/x/oak_compress/mod.ts";

const app = new DanetApplication();
app.addGlobalMiddlewares(brotli());
// app.addGlobalMiddlewares(gzip());
// app.addGlobalMiddlewares(deflate());
```
!!!hint **Hint**
Feel free to use any other compression middleware you like
!!!
