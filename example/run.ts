import { DanetApplication } from '../src/mod.ts';
import { Injectable, SCOPE } from '../src/injector/injectable/mod.ts';
import { Module } from '../src/module/mod.ts';
import { Controller, Get, Post } from '../src/router/controller/mod.ts';

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
	postMethod() {
	}
}

@Module({
	controllers: [FirstController],
})
class FirstModule {}

const app = new DanetApplication();
await app.init(FirstModule);
await app.listen(3000);
console.log('listening on port 3000');
