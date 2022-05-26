If you want your Danet app to serve static files from a specific folder, for example to serve a .png, you simply have to register the folder using `useStaticAssets` method from your `DanetApplication` instance as following : 

```ts
  const app = new DanetApplication();
  await app.init(MyModule);
  const staticAssetsPath = `${Deno.cwd()}/assets`;
  app.useStaticAssets(staticAssetsPath);
```
