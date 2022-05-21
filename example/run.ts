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

@Controller('/my-controller-path')
class FirstController {
	constructor() {
	}
	@Get('')
	getMethod() {
		return 'OK';
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
	controllers: [FirstController],
})
class FirstModule {}

const app = new DanetApplication();
await app.init(FirstModule);
const serve = app.listen(3000);
console.log('listening on port 3000');
await serve;
