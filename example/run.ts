import { DanetApplication } from '../src/mod.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/mod.ts';
import { Module } from '../src/module/mod.ts';
import { All, Body, Controller, Get, Post, Req } from '../src/router/controller/mod.ts';

@Injectable({ scope: SCOPE.REQUEST })
class Child2 {
}

@Injectable({ scope: SCOPE.REQUEST })
class Child1 {
	constructor(public child: Child2) {
	}
	getHelloWorld() {
		return 'Hello World';
	}
}

@Controller('')
class FirstController {
	constructor(public child1: Child1, public child2: Child2) {
	}
	@Get('')
	getMethod() {
		return this.child1.getHelloWorld();
	}

	@Post('post')
	postMethod(@Body() body: any) {
		return body;
	}

	@All('/all')
	allHandler(@Req() req: Request) {
	  return req.method;
	}
}

@Module({
	imports: [],
	controllers: [FirstController],
	injectables: [Child1, Child2],
})
class FirstModule {}

const app = new DanetApplication();
app.bootstrap(FirstModule);

const port = 3000;
const serve = app.listen(port);
console.log('listening on port 3000');
await serve;
