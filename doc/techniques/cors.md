---
label: CORS
order: 60
---

Cross-origin resource sharing (CORS) is a mechanism that allows resources to be requested from another domain. Under the hood, Danet makes use of this [cors package for Deno](https://deno.land/x/cors). This package provides various options that you can customize based on your requirements.

### Getting started

To enable CORS, call the `enableCors()` method on the Danet application object.

```typescript
const app = new DanetApplication();
app.enableCors();
```

The `enableCors()` method takes an optional configuration object argument. The available properties of this object are described in the official [CORS package](https://deno.land/x/cors@v1.2.2#configuration-options) documentation. 