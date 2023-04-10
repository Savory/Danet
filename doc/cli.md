---
label: CLI
order: 1
---
## Overview

The [Danet CLI](https://github.com/Savory/Danet-CLI) is a command-line interface tool that helps you to initialize your Danet applications.

In the future, it will assist in multiple ways, including scaffolding the project, serving it in development mode, and building and bundling the application for production distribution. It embodies best-practice architectural patterns to encourage well-structured apps.

### Installation

Installing Deno packages as a commands is simple. You can install them under any name you want. For simplicity's sake, we install our danet-cli under the name `danet`.  

```bash
$ deno install --allow-read --allow-write --allow-run --allow-env -n danet https://deno.land/x/danet_cli/main.ts
```

### Basic workflow

Once installed, you can invoke CLI commands directly from your OS command line through the `danet` command. See the available `danet` commands by entering the following:

```bash
$ danet --help
```

To create, run a new basic Danet project, go to the folder that should be the parent of your new project, and run the following commands:

```bash
$ danet new my-danet-project
$ cd my-danet-project
$ danet develop //run with file watching
$ danet start  //run without file watching
```

In your browser, open [http://localhost:3000](http://localhost:3000) to see the new application running.

### Database Options

When creating a new project, Danet CLI will ask you what database provider you want to use between `mongodb`, `postgres` and `in-memory` and will generate all the required code.

The only thing left if you use `mongodb` or `postgres` will be to set environment variables or put them in a `.env` file in your project's root folder.

However, if you need it to be less interactive, you can pass the followings options when calling `danet new` : 

- `--mongodb`
- `--postgres`
- `--in-memory`