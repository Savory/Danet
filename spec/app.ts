import { DanetApplication } from '../src/app.ts';
import { Module } from '../src/module/decorator.ts';
import {
	Controller,
	Delete,
	Get,
	Post,
	Put,
} from '../src/router/controller/decorator.ts';

@Controller('nice-controller')
class SimpleController {
	@Get('/')
	simpleGet() {
		return 'OK GET';
	}

	@Post('/')
	simplePost() {
		return 'OK POST';
	}

	@Put('/')
	simplePut() {
		return 'OK PUT';
	}

	@Delete('/')
	simpleDelete() {
		return 'OK DELETE';
	}
}

@Module({
	controllers: [SimpleController],
})
class MyModule {}

export const app = new DanetApplication();
await app.init(MyModule);
// await app.listen(3000);
