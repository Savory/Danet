import { ExecutionContext } from '../router/router.ts';

/**
 * An authentication guard is responsible for determining whether a request
 * should be allowed to proceed based on the provided execution context.
 */
export interface AuthGuard {
	canActivate(context: ExecutionContext): Promise<boolean> | boolean;
}
