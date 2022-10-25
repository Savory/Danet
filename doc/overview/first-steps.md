---
order: 100
---

In this set of articles, you'll learn the **core fundamentals** of Danet. To get familiar with the essential building blocks of Danet applications, we'll build a basic CRUD application with features that cover a lot of ground at an introductory level.

### Prerequisites

Please make sure that [Deno](https://deno.land/) (version >= Install
v1.24.3) is installed on your operating system.

### Setup

The easiest way to set up a Danet project is by using our Danet CLI

[!ref](/cli.md)

```bash
$ deno install --allow-read --allow-write --allow-run --allow-env -n danet https://deno.land/x/danet_cli/main.ts
$ danet new my-danet-project
$ cd my-danet-project
```

The app is a TODO CRUD API with either MongoDB, Postgres or In-Memory database depending on what you choose when executing `danet new` command !

### Using MongoDB or Postgres

To run the app, you need a database server running one or the other. We assume you know how to do that.

Then, you have to add your server's information somewhere so Danet can access these information to connect to the server.

You have 2 ways of doing so :

#### Environment variables

Add the following variables:

DB_NAME=
DB_HOST=
DB_PORT
DB_USERNAME
DB_PASSWORD=

#### Dotenv

Danet has built-in `dotenv` support (because Deno support it natively), so you can create a `.env` file at your project's root the same variables : 

``` .env
DB_NAME=
DB_HOST=
DB_PORT
DB_USERNAME
DB_PASSWORD=
```

!!!info Hint
We provide an `.env.example` file in the project
!!!


### Running the application

Once the installation process is complete, you can run the following command at your OS command prompt to start the application listening for inbound HTTP requests:

  ```bash
$ deno task launch-server
```