import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Response } from 'https://deno.land/x/oak@v9.0.1/response.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import {
	Controller,
	Get,
	Post,
} from '../src/router/controller/decorator.ts';
import {
	Body, Param,
	Query,
	Res,
} from '../src/router/controller/params/decorators.ts';

@Controller('')
class SimpleController {
	@Get('/')
	simpleGet(@Res() res: Response, @Query('myvalue') myvalue: string) {
		return myvalue;
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
	app.listen(3000);

	const res = await fetch('http://localhost:3000?myvalue=foo', {
		method: 'GET',
	});
	const text = await res.text();
	assertEquals(text, `foo`);
	await app.close();
});

Deno.test('@Body decorator with attribute', async () => {
	await app.init(MyModule);
	app.listen(3000);

	const res = await fetch('http://localhost:3000', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: '{"whatisit": "batman"}'
	});
	const text = await res.text();
	assertEquals(text, `batman`);
	await app.close();
});


Deno.test('@Body decorator', async () => {
	await app.init(MyModule);
	app.listen(3000);

	const res = await fetch('http://localhost:3000/full-body/', {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: '{"whatisit": "batman"}'
	});
	const json = await res.json();
	assertEquals(json, {
		whatisit: 'batman'
	});
	await app.close();
});

Deno.test('@Param decorator', async () => {
	await app.init(MyModule);
	app.listen(3000);

	const res = await fetch('http://localhost:3000/batman', {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	});
	const text = await res.text();
	assertEquals(text, 'batman');
	await app.close();
});
