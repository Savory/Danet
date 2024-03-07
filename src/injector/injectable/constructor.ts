import { Constructor } from '../../utils/constructor.ts';

export type InjectableConstructor = Constructor;
export class TokenInjector {
	constructor(public useClass: InjectableConstructor, public token: string) {
	}
}
export type UseClassInjector = {
	useClass: InjectableConstructor;
	token: string;
};
export type UseValueInjector = {
	// deno-lint-ignore no-explicit-any
	useValue: any;
	token: string;
};
