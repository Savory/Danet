import { assertEquals } from 'https://deno.land/std@0.135.0/testing/asserts.ts';
import { Response } from 'https://deno.land/x/oak@v9.0.1/response.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import {
	Controller,
	Delete,
	Get,
	Post,
	Put,
} from '../src/router/controller/decorator.ts';
import {
	Body,
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

	@Post('/')
	wholeBody(@Body() fullBody: unknown) {
		return fullBody;
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

const app = new DanetApplication();

Deno.test('@Res and @Query decorator', async (ctx) => {
	await app.init(MyModule);
	const nonBlockingListen = new Promise(async (resolve) => {
		await app.listen(3000);
		resolve(true);
	});

	const res = await fetch('http://localhost:3000?myvalue=foo', {
		method: 'GET',
	});
	const text = await res.text();
	assertEquals(text, `foo`);
	await app.close();
	await nonBlockingListen;
});
