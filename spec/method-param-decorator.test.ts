import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import { Controller, Get, Post } from '../src/router/controller/decorator.ts';
import {
	Body,
	Header,
	Param,
	Query,
} from '../src/router/controller/params/decorators.ts';

@Controller('')
class SimpleController {
	@Get('/query/myvalue/all')
	simpleGetMyValueAll(@Query('myvalue', { value: 'array' }) myvalue: string[]) {
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

	@Get('/:myparam')
	queryParam(@Param('myparam') niceValue: string) {
		return niceValue;
	}

	@Post('full-body')
	wholeBody(@Body() fullBody: unknown) {
		return fullBody;
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

const app = new DanetApplication();

Deno.test('@Res and @Query decorator', async () => {
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
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/query/myvalue/all?myvalue=foo&myvalue=bar`,
		{
			method: 'GET',
		},
	);
	const json = await res.json();
	assertEquals(json, ['foo', 'bar']);

	await app.close();
});

Deno.test(`@Query decorator with value 'last' to return the last value for a given query parameter`, async () => {
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

Deno.test(`@Query decorator with no key and value 'array' to return all values of all query parameters`, async () => {
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

Deno.test('@Header decorator with attribute', async () => {
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
