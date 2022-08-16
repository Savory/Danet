# Rendering HTML

Building API is cool, but sometime, we want to build a simple MVC app that will
render HTML.

For this, Danet integrate the [Handlebars](https://handlebarsjs.com/) templating
engine.

## Before writing any code

#### Create the following directory at your project's root

```
/views
/views/layouts
/views/partials
```

!!!info Info
If you want to put these directory elsewhere, you can provide the
path to `views` at runtime with `app.setViewEngineDir('my/path/to/views);`
!!!

#### Create a default layout called `main.hbs` with the following content:

```handlebars
{{{body}}}
```

## Let's render things now !

First, let's create your first template called `hello.hbs` in the `views`
directory. It will print 2 variables passed from your controller.

```handlebars
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{title}}</title>
  </head>
  <body>
    Hello
    {{name}}!
  </body>
</html>
```

Now, let's tell your controller it has to render this view on a specific route:

```ts
@Controller('nice-controller')
class MyController {
  @Render('hello')
  @Get('/')
  renderANiceHTML() {
    return { title: "the page title", name: "world" };
  }
}
```

We specify the template to use with the `@Render()` decorator, and the return
value of the route handler is passed to the template for rendering.

Notice that the return value is an object with `title` and `name` properties,
matching `title` and `name` placeholders we used in the template.
