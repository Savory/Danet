import { Constructor } from '../../utils/constructor.ts';

export type InjectableConstructor = Constructor;
export class TokenInjector {

  constructor(public useClass: InjectableConstructor, public token: string) {
  }
}
