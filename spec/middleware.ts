import { assertEquals } from '../src/deps_test.ts';
import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import {
	Controller,
	Get,
} from '../src/router/controller/decorator.ts';
import { Injectable } from '../src/injector/injectable/decorator.ts';
import { HttpContext } from '../src/router/router.ts';
import { Middleware } from '../src/router/middleware/decorator.ts';

@Injectable()
class SimpleInjectable {
	doSomething() {
		return 'I did something';
	}
}

@Injectable()
class SimpleMiddleware {
	constructor(private simpleInjectable: SimpleInjectable) {
	}

	action(ctx: HttpContext) {
		ctx.response.body = `${ctx.response.body as string || ''}` + this.simpleInjectable.doSomething();
	}

}
@Injectable()
class SecondMiddleware {
	constructor() {
	}

	action(ctx: HttpContext) {
		ctx.response.body = `${ctx.response.body as string || ''}` + ' ' + 'more';
	}

}

@Controller('simple-controller')
class SimpleController {

	@Get('/')
	@Middleware(SimpleMiddleware)
	getWithMiddleware() {

	}
}

@Middleware(SecondMiddleware, SimpleMiddleware)
@Controller('controller-with-middleware')
class ControllerWithMiddleware {

	@Get('/')
	getWithoutMiddleware() {

	}
}

@Module({
	controllers: [SimpleController, ControllerWithMiddleware],
	injectables: [SimpleInjectable],
})
class MyModule {}

const app = new DanetApplication();
Deno.test('Middleware method decorator', async () => {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/simple-controller`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	assertEquals(text, `I did something`);
	await app.close();
});

Deno.test('Middleware controller decorator', async () => {
	await app.init(MyModule);
	const listenEvent = await app.listen(0);

	const res = await fetch(
		`http://localhost:${listenEvent.port}/controller-with-middleware`,
		{
			method: 'GET',
		},
	);
	const text = await res.text();
	//order is mixed up on purpose to check that argument order prevails
	assertEquals(text, ` moreI did something`);
	await app.close();
});