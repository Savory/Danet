---
label: Deno Deploy
order: 3
---
## Introduction

Deno Deploy is a distributed system that allows you to run JavaScript, TypeScript, and WebAssembly close to users, at the edge, worldwide. Deeply integrated with the V8 runtime, Deno deploy servers provide minimal latency and eliminate unnecessary abstractions. You can develop your script locally using the Deno CLI, and then deploy it to our managed infrastructure in less than a second, without the need to configure anything.

!!!info **Hint**
Learn more on the [official Deno Deploy website](https://deno.com/deploy)
!!!


## First step


### Create an account 
Before diving into the (few) commands required to deploy your Danet project from your local environment or from a Github action, you need to [create an account on Deno Deploy](https://deno.com/deploy/pricing).

At the time of writing this documentation, Deploy offers 2 pricing.

0$ for : 
- 100,000 requests per day
- 100 GiB outbound data transfer per month (inbound is free)
- Up to 10ms CPU time (not wall clock time) per request

10$ per month for :

- Wildcard subdomains
-Up to 50ms CPU time (not wall clock time) per request
- 5 million requests per month included
- 100 GiB outbound data transfer included (inbound is free)

You can start with the free tier and upgrade when you see need !

The signing up process is pretty simple, login with github and voilà.

!!!info **Hint**
The Github integration allows you to deploy from Github actions without the need of any secret/environment variable
!!!

### Create a project

Now that you have an account, you need to create a Deploy project to deploy to.

Thanks to Github integration, you have access to your repository list, and can easily select which repo you want to deploy on this project.

Then, you must select the branch which will be deployed, and how will be your Continuous Deployment:
- Automatic, so your project is deployed on pushes as is
- Github Action, if you want to add a build step before deploying.

For Danet project, we need to select "Github Action".

Last input is to name your project, this will also be your project subdomain.


### Deploy from your local environment

If you want a fast way to test deploy, you can easily do so in 3 commands.

TLDR: 

```bash
$ danet bundle my-app.js
$ cd bundle
$ deployctl deploy --project=YOUR_PROJECT_NAME --no-static --token=YOUTOKEN my-app.js
```

!!!info **Hint**
`deployctl` is from https://deno.com/deploy/docs/deployctl

Your token can be created/found [here](https://dash.deno.com/account#access-tokens)
!!!


#### Bundle your application
Bundling is the action of creating one JS file which contains all your project source code.
 We recommend that you use `danet bundle` command to bundle, but feel free to use any bundler you want as long as it handles "emitDecoratorMetadata" option.

```bash
$ danet bundle my-app.js
```
#### Deploy to DD
Now that you have your whole app bundled, you can send this .js file to deploy.
In order to do so, you need to [get your access token from Deploy](https://dash.deno.com/account#access-tokens)
```bash
$ deployctl deploy --project=YOUR_PROJECT_NAME --no-static --token=YOUTOKEN my-app.js
```

### Github Action

If you created your project with our CLI, you already have a workflow ready in `.github/workflows/run-test.yml` to be used, you simply need to put your project name in the last step :

```yaml
      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: YOUR PROJECT NAME HERE
          entrypoint: run.js
          root: bundle
```

If you don't have it (because you used an older version of the starter project), we got your back. 

Create a yaml file in `.github/workflows` folder, something like `deploy.yml` Follow these steps : 

#### Setup the workflow:

```yaml
name: Deploy to Deno Deploy

on:
  push:
    branches: [main]

permissions:
  contents: read
  id-token: write # Needed for auth with Deno Deploy
```
#### Setup jobs

Then, we need a job to run, which is what will be done on push. 

- Pull the repository.
- Setup Deno (install it on the worker).
- Install Danet CLI.
- Bundle our app with `danet bundle` command
- Send the bundle on Deploy

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Setup repo
        uses: actions/checkout@v3

      - name: Setup Deno
        # uses: denoland/setup-deno@v1
        uses: denoland/setup-deno@004814556e37c54a2f6e31384c9e18e983317366
        with:
          deno-version: v1.x

      - name: Install Danet CLI
        run: deno install --allow-read --allow-write --allow-run --allow-env -n danet https://deno.land/x/danet_cli/main.ts

      - name: Bundle app with danet CLI
        run: danet bundle run.js

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: YOUR-PROJECT-NAME
          entrypoint: run.js
          root: bundle
```

#### Full working example

Check our own workflow on the Starter project [here](https://github.com/Savory/Danet-Starter/blob/main/.github/workflows/run-tests.yml)

