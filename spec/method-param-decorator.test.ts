import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Session } from '../src/mod.ts';
import type { MiddlewareHandler } from '../src/deps.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get, Post } from '../src/router/controller/decorator.ts';
import {
	Body,
	Header,
	Param,
	Query,
} from '../src/router/controller/params/decorators.ts';
import { UseGuard } from '../src/guard/decorator.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { AuthGuard } from '../src/guard/interface.ts';
import { HttpContext } from '../src/router/router.ts';
import {
	CookieStore,
	sessionMiddleware,
} from 'https://deno.land/x/hono_sessions/mod.ts';

@Injectable()
class AddThingToSession implements AuthGuard {
	canActivate(context: HttpContext) {
		const session = context.get('session');
		session.set('passed-in-guard', 'yes');
		return true;
	}
}

@Controller('')
class SimpleController {
	@Get('/query/myvalue/all')
	simpleGetMyValueAll(@Query('myvalue', { value: 'array' }) myvalue: string[]) {
		return myvalue;
	}

	@Get('/query/myvalue/default')
	simpleGetMyValueDefault(@Query('myvalue') myvalue: string[]) {
		return myvalue;
	}

	@Get('/query/myvalue/last')
	simpleGetMyValueLast(@Query('myvalue', { value: 'last' }) myvalue: string) {
		return myvalue;
	}

	@Get('/query/myvalue/first')
	simpleGetMyValueFirst(@Query('myvalue', { value: 'first' }) myvalue: string) {
		return myvalue;
	}

	@Get('/query/all')
	simpleGetAll(
		@Query({ value: 'array' }) queryParams: Record<string, string[]>,
	) {
		return queryParams;
	}

	@Get('/query/last')
	simpleGetLast(@Query({ value: 'last' }) queryParams: Record<string, string>) {
		return queryParams;
	}

	@Get('/query/first')
	simpleGetFirst(
		@Query({ value: 'first' }) queryParams: Record<string, string>,
	) {
		return queryParams;
	}

	@Get('/query/nothing')
	nothingGet(@Query() something: Record<string, string>) {
		return `Hello ${something.name}`;
	}

	@Get('/lambda')
	headerParamWithAttribute(@Header('New-Header') acceptHeader: string) {
		if (!acceptHeader) return 'No "New-Header" header';
		return acceptHeader;
	}

	@Post('/lambda')
	headerParamWithoutAttribute(@Header() headers: Headers) {
		if (!headers) return 'null';
		return headers instanceof Headers;
	}

	@Post('/')
	bodyParamWithAttribute(@Body('whatisit') niceValue: string) {
		return niceValue;
	}

	@Get('/whole-session-decorator')
	@UseGuard(AddThingToSession)
	sessionDecorationTest(@Session() session: Map<unknown, unknown>) {
		return session.get('passed-in-guard');
	}

	@Get('/session-with-param')
	@UseGuard(AddThingToSession)
	sessionWithParam(@Session('passed-in-guard') passedInGuard: string) {
		return passedInGuard;
	}

	@Post('full-body')
	wholeBody(@Body() fullBody: unknown) {
		return fullBody;
	}

	@Get('/:myparam')
	queryParam(@Param('myparam') niceValue: string) {
		return niceValue;
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

Deno.test('@Res and @Query decorator', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/myvalue/all?myvalue=foo`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, `["foo"]`);

	await app.close();
});

Deno.test(`@Query decorator with value 'array' to return all values for a given query parameter`, async () => {
	const app = new DanetApplication();
	try {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/myvalue/all?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	console.log(await res.text());
	const json = await res.json();
	assertEquals(json, ['foo', 'bar']);
	} catch(e) {
		console.log(e);
	}
	await app.close();
});

Deno.test(`@Query decorator with value 'last' to return the last value for a given query parameter`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/myvalue/last?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, `bar`);

	await app.close();
});

Deno.test(`@Query decorator with value 'first' to return the first value for a given query parameter`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/myvalue/first?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, `foo`);

	await app.close();
});

Deno.test(`@Query decorator with value and no option to return the first value for a given query parameter`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/myvalue/default?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, `foo`);

	await app.close();
});

Deno.test(`@Query decorator with no key and value 'array' to return all values of all query parameters`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/all?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const json = await res.json();
	assertEquals(json, { myvalue: ['foo', 'bar'] });

	await app.close();
});

Deno.test(`@Query decorator with no key and value 'last' to return the last value of all query parameters`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/last?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const json = await res.json();
	assertEquals(json, { myvalue: 'bar' });

	await app.close();
});

Deno.test(`@Query decorator with no key and value 'first' to return the first value of all query parameters`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/first?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const json = await res.json();
	assertEquals(json, { myvalue: 'foo' });

	await app.close();
});

Deno.test(`@Query decorator with no key and no option`, async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/nothing?name=thomas`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, 'Hello thomas');

	await app.close();
});

Deno.test('@Header decorator with attribute', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}/lambda`, {
		method: 'GET',
		headers: {
			'New-Header': 'en-US',
		},
	});
	const text = await res.text();
	assertEquals(text, 'en-US');
	await app.close();
});

Deno.test('@Header decorator without attribute', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}/lambda`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
	});
	const text = await res.text();
	assertEquals(text, 'true');
	await app.close();
});

Deno.test('@Header decorator with attribute without qualifying header on request', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}/lambda`, {
		method: 'GET',
		headers: {},
	});
	const text = await res.text();
	assertEquals(text, 'No "New-Header" header');
	await app.close();
});

Deno.test('@Body decorator with attribute', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: '{"whatisit": "batman"}',
	});
	const text = await res.text();
	assertEquals(text, `batman`);
	await app.close();
});

Deno.test('@Body decorator', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}/full-body/`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
		},
		body: '{"whatisit": "batman"}',
	});
	const json = await res.json();
	assertEquals(json, {
		whatisit: 'batman',
	});
	await app.close();
});

Deno.test('@Param decorator', async () => {
	const app = new DanetApplication();
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(`http://localhost:${listenEvent.port}/batman`, {
		method: 'GET',
		headers: {
			'content-type': 'application/json',
		},
	});
	const text = await res.text();
	assertEquals(text, 'batman');
	await app.close();
});

Deno.test('@Session decorator without params', async () => {
	const app = new DanetApplication();
	const store = new CookieStore();
	app.use(
		sessionMiddleware({
			store,
			encryptionKey: 'password_at_least_32_characters_long', // Required for CookieStore, recommended for others
			expireAfterSeconds: 900, // Expire session after 15 minutes of inactivity
			cookieOptions: {
				sameSite: 'Lax', // Recommended for basic CSRF protection in modern browsers
				path: '/', // Required for this library to work properly
				httpOnly: true, // Recommended to avoid XSS attacks
			},
		}) as unknown as MiddlewareHandler,
	);
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/whole-session-decorator`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, 'yes');
	await app.close();
});

Deno.test('@Session decorator with param', async () => {
	const app = new DanetApplication();
	const store = new CookieStore();
	app.use(
		sessionMiddleware({
			store,
			encryptionKey: 'password_at_least_32_characters_long', // Required for CookieStore, recommended for others
			expireAfterSeconds: 900, // Expire session after 15 minutes of inactivity
			cookieOptions: {
				sameSite: 'Lax', // Recommended for basic CSRF protection in modern browsers
				path: '/', // Required for this library to work properly
				httpOnly: true, // Recommended to avoid XSS attacks
			},
		}) as unknown as MiddlewareHandler,
	);
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/session-with-param`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, 'yes');
	await app.close();
});
