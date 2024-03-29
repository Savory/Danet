import {
	Controller,
	DanetApplication,
	EventEmitter,
	EventEmitterModule,
	Module,
	OnEvent,
	Post,
} from '../mod.ts';

type User = {};

class UserListeners {
	@OnEvent('new-user')
	notifyUser(user: User) {
		console.log('new user created', user);
	}

	@OnEvent('new-user')
	async sendWelcomeEmail(user: User) {
		console.log('send email', user);
	}
}

@Controller('user')
class UserController {
	constructor(
		private eventEmitter: EventEmitter,
	) {}

	@Post()
	create() {
		const user: User = {};
		this.eventEmitter.emit('new-user', user);
		return JSON.stringify(user);
	}
}

@Module({
	imports: [EventEmitterModule],
	controllers: [UserController],
	injectables: [UserListeners],
})
class AppModule {}

const app = new DanetApplication();
await app.init(AppModule);

let port = Number(Deno.env.get('PORT'));
if (isNaN(port)) {
	port = 3000;
}
app.listen(port);
