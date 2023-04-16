---
label: Deno's Fresh Integration
order: 4
---
## Introduction

Fresh is a next generation web framework, built for speed, reliability, and simplicity.

Some stand-out features:

- Just-in-time rendering on the edge.
- Island based client hydration for maximum interactivity.
- Zero runtime overhead: no JS is shipped to the client by default.
- No build step.
- No configuration necessary.
- TypeScript support out of the box.
- File-system routing à la Next.js.

!!!info **Hint**
Learn more on the [official Deno Fresh website](https://fresh.deno.dev/)
!!!


## Integration with Danet

We believe that Fresh is an awesome framework for frontend thanks to Server-Side-Rendering (SSR) with partial hydration, File-system routing and Typescript support.

However, in our opinion, it lacks backend specialized features to enable developers to build enterprise grade backend architecture with flexibility and robustness. 

At the same time, Danet lacks specialized features to build awesome frontends.

This is why we worked towards providing a way to run both, from the same process. Allowing you to render awesome pages with Fresh while have a robust business logic/API code which can also be used in Fresh SSR for the first rendering.

There are two ways of doing so :

- serve Fresh content from `/` path and your API endpoints from a dedicated prefix such as `/api`
- serve Fresh content from a dedicated prefix, such as `/dashboard` and your API endpoints from root `/`


!!!warning **Deploy**
Until Deno Deploy handles `emitDecoratorMetadata` compiler option, or Fresh handles bundling, there is no way to deploy a Danet app with Fresh integration on Deno Deploy if you use an instance of `DanetApplication` in Fresh islands.
!!!

### Folder and Files setup

Good news, there is little to no change in your Danet or Fresh app's folder structure !

Let's say you have a `danet-app` (generated from our CLI) and a `fresh-app` (generated from [fresh getting-started](https://fresh.deno.dev/#getting-started) ) next to each other as following :

![Screenshot 2023-04-16 at 17 08 48](https://user-images.githubusercontent.com/38007824/232283998-89510982-c917-474f-9a25-b80bbb8fc301.png)


Move `fresh-app` into `danet-app/src` (we don't show all files that exist for clarity purpose):

![Screenshot 2023-04-16 at 17 08 13](https://user-images.githubusercontent.com/38007824/232283976-e4551764-8333-463a-a003-47dee910a44b.png)


You can delete `fresh-app/dev.ts` and `fresh-app/main.ts`, but remember the plugins you use in `fresh-app/main.ts`, to pass them as parameters when enabling Fresh from your Danet app.

### Fresh from root

To enable Fresh from `/`, use our Fresh Module call : `FreshModule.enableFreshFromRoot` from your `DanetApplication`, **BEFORE** calling `.init`.
This method argument are:
- Your DanetApplication
- Fresh folder URL
- the prefix from where you want your Danet's routes to be accessible
- Fresh start configuration object.:

```ts bootstrap.ts
import { AppModule } from './app.module.ts';
import { DanetApplication } from 'danet/mod.ts';
import { configAsync } from 'dotenv/mod.ts';
import twindConfig from "./dashboard/twind.config.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import { FreshModule } from "danet-fresh/mod.ts";

export const application = new DanetApplication();
export const bootstrap = async () => {
    await configAsync({export: true});

    const freshAppDirectory = new URL('./fresh-app/', import.meta.url);
    await FreshModule.enableFreshOnRoot(application, freshAppDirectory, '/api', {plugins: [twindPlugin(twindConfig)]});

    await application.init(AppModule);

    return application;
};

```
!!!info **Hint**
`danet-fresh/mod.ts` is declared in the import map to point to https://deno.land/x/danet_fresh/
!!!


### Fresh from a given path

To enable Fresh from a given path, simply call : `.enableFresh` from your `DanetApplication`, **BEFORE** calling `.init`.
This method argument are:
- Your DanetApplication
- Fresh folder URL
- the prefix from where you want your Fresh routes to be accessible
- Fresh start configuration object.:

```ts bootstrap.ts
import { AppModule } from './app.module.ts';
import { DanetApplication } from 'danet/mod.ts';
import { configAsync } from 'dotenv/mod.ts';
import twindConfig from "./dashboard/twind.config.ts";
import twindPlugin from "$fresh/plugins/twind.ts";
import { FreshModule } from "danet-fresh/mod.ts";

export const application = new DanetApplication();
export const bootstrap = async () => {
 await configAsync({ export: true });
 
 const freshAppDirectory = new URL('./fresh-app/', import.meta.url);
 await FreshModule.enableFresh(application, freshAppDirectory, '/dashboard', { plugins: [twindPlugin(twindConfig)] });
 
 await application.init(AppModule);
 
 return application;
};

```

!!!info **Hint**
`danet-fresh/mod.ts` is declared in the import map to point to https://deno.land/x/danet_fresh/
!!!


### Working example

There is a [specific branch on our starter project](https://github.com/Savory/Danet-Starter/tree/fresh-integration) with a demo Fresh app in `src/dashboard` folder, served from root. 

Check it out if needed !

