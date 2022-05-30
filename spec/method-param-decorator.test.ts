import { assertEquals } from "../src/deps_test.ts";
import { Response } from "../src/deps.ts";
import { DanetApplication } from "../src/app.ts";
import { Module } from "../src/module/decorator.ts";
import { Controller, Get, Post } from "../src/router/controller/decorator.ts";
import {
  Body,
  Param,
  Query,
  Header,
  Res,
} from "../src/router/controller/params/decorators.ts";

@Controller("")
class SimpleController {
  @Get("/")
  simpleGet(@Res() res: Response, @Query("myvalue") myvalue: string) {
    return myvalue;
  }

  @Get("/lambda")
  headerParamWithAttribute(@Header("Accept") acceptHeader: string) {
    return acceptHeader;
  }

  @Post("/lambda")
  headerParamWithoutAttribute(@Header() headers: Headers) {
    return headers instanceof Headers;
  }

  @Post("/")
  bodyParamWithAttribute(@Body("whatisit") niceValue: string) {
    return niceValue;
  }

  @Get("/:myparam")
  queryParam(@Param("myparam") niceValue: string) {
    return niceValue;
  }

  @Post("full-body")
  wholeBody(@Body() fullBody: unknown) {
    return fullBody;
  }
}

@Module({
  controllers: [SimpleController],
})
class MyModule {}

const app = new DanetApplication();

Deno.test("@Res and @Query decorator", async () => {
  await app.init(MyModule);
  const port = (await app.listen(0)).port;

  const res = await fetch(`http://localhost:${port}?myvalue=foo`, {
    method: "GET",
  });
  const text = await res.text();
  assertEquals(text, `foo`);
  await app.close();
});

Deno.test("@Header decorator with attribute", async () => {
  await app.init(MyModule);
  const port = (await app.listen(0)).port;

  const res = await fetch(`http://localhost:${port}/lambda`, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });
  const text = await res.text();
  assertEquals(text, "application/json");
  await app.close();
});

Deno.test("@Header decorator without attribute", async () => {
  await app.init(MyModule);
  const port = (await app.listen(0)).port;

  const res = await fetch(`http://localhost:${port}/lambda`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });
  const text = await res.text();
  assertEquals(text, "true");
  await app.close();
});

Deno.test("@Body decorator with attribute", async () => {
  await app.init(MyModule);
  const port = (await app.listen(0)).port;

  const res = await fetch(`http://localhost:${port}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: '{"whatisit": "batman"}',
  });
  const text = await res.text();
  assertEquals(text, `batman`);
  await app.close();
});

Deno.test("@Body decorator", async () => {
  await app.init(MyModule);
  const port = (await app.listen(0)).port;

  const res = await fetch(`http://localhost:${port}/full-body/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: '{"whatisit": "batman"}',
  });
  const json = await res.json();
  assertEquals(json, {
    whatisit: "batman",
  });
  await app.close();
});

Deno.test("@Param decorator", async () => {
  await app.init(MyModule);
  const port = (await app.listen(0)).port;

  const res = await fetch(`http://localhost:${port}/batman`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });
  const text = await res.text();
  assertEquals(text, "batman");
  await app.close();
});
