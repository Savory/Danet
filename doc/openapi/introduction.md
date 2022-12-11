---
order: 99
---


The [OpenAPI](https://swagger.io/specification/) specification is a language-agnostic definition format used to describe RESTful APIs. Danet provides a dedicated [module](https://github.com/Savory/Danet-Swagger) which allows generating such a specification by leveraging decorators.


!!!danger
The SwaggerModule is currently in Alpha, maaaany features are missing. If something you need is not here yet, [please fill an issue/feature request](https://github.com/Savory/Danet-Swagger/issues)
!!!


### Bootstrap

Simply open the `bootstrap.ts` file and initialize Swagger using the `SwaggerModule` class:

```ts bootstrap.ts 
import { DanetApplication } from 'https://deno.land/x/danet/mod.ts';
import { SwaggerModule, SpecBuilder } from 'https://deno.land/x/danet_swagger/mod.ts';
import { AppModule } from './app.module';

async function bootstrap() {
  const application = new DanetApplication();
  await application.init(AppModule);
  const spec = new SpecBuilder()
    .setTitle('Todo')
    .setDescription('The todo API')
    .setVersion('1.0')
    .build();
  const document = await SwaggerModule.createDocument(application, spec);
  SwaggerModule.setup('api', application, document);
  return application;
}
```
!!!Hint
`document` (returned by the `SwaggerModule#createDocument()` method) is a serializable object conforming to [OpenAPI Document](https://swagger.io/specification/#openapi-document). Instead of hosting it via HTTP, you could also save it as a JSON/YAML file, and consume it in different ways.
!!!

The `SpecBuilder` helps to structure a base document that conforms to the OpenAPI Specification. It provides several methods that allow setting such properties as title, description, version, etc. In order to create a full document (with all HTTP routes defined) we use the `createDocument()` method of the `SwaggerModule` class. This method takes two arguments, an application instance and a Swagger options object.

Once we create a document, we can call the `setup()` method. It accepts:

1. The path to mount the Swagger UI
2. An application instance
3. The document object instantiated above

Now you can run the following command to start the HTTP server:

```bash
$ deno task launch-server
```

While the application is running, open your browser and navigate to `http://localhost:3000/api`. You should see the Swagger UI.

![image](https://user-images.githubusercontent.com/38007824/206904215-c99be01c-7db0-4868-8cc8-63fe9046e3af.png)

The `SwaggerModule` automatically reflects all of your endpoints.

!!!Hint
To generate and download a Swagger JSON file, navigate to `http://localhost:3000/api/json` (assuming that your Swagger documentation is available under `http://localhost:3000/api`).
!!!
