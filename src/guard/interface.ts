import { ExecutionContext } from '../router/router.ts';

export interface AuthGuard {
	canActivate(context: ExecutionContext): Promise<boolean> | boolean;
}
