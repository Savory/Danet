import {
	All,
	Body,
	Controller,
	DanetApplication,
	Get,
	Injectable,
	Module,
	Param,
	Post,
	Query,
	Req,
	SCOPE,
} from '../src/mod.ts';

@Injectable()
class SharedService {
	sum(nums: number[]): number {
		return nums.reduce((sum, n) => sum + n, 0);
	}
}

@Injectable({ scope: SCOPE.REQUEST })
class ScopedService2 {
	getWorldHello() {
		return 'World Hello';
	}
}

@Injectable({ scope: SCOPE.REQUEST })
class ScopedService1 {
	constructor(public child: ScopedService2) {
	}
	getHelloWorld(name: string) {
		return `Hello World ${name}`;
	}
}

@Controller('')
class FirstController {
	constructor(
		private sharedService: SharedService,
		private scopedService1: ScopedService1,
		private scopedService2: ScopedService2,
	) {
	}

	@Get('')
	getMethod() {
		return 'OK';
	}

	@Get('hello-world/:name')
	getHelloWorld(
		@Param('name') name: string,
	) {
		return this.scopedService1.getHelloWorld(name);
	}

	@Get('world-hello')
	getWorldHello() {
		return this.scopedService2.getWorldHello();
	}

	@Get('sum')
	getSum(
		@Query('num') numParams: string | string[],
	) {
		const numString = Array.isArray(numParams) ? numParams : [numParams];
		return this.sharedService.sum(numString.map((n) => Number(n)));
	}

	@Post('post')
	// deno-lint-ignore no-explicit-any
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
	injectables: [SharedService, ScopedService1, ScopedService2],
})
class FirstModule {}

const app = new DanetApplication();
await app.init(FirstModule);

let port = Number(Deno.env.get('PORT'));
if (isNaN(port)) {
	port = 3000;
}
app.listen(port);
