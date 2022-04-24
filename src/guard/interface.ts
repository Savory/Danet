import { HttpContext } from '../router/router.ts';

export interface AuthGuard {
  canActivate(context:HttpContext): void;
  canActivate(context: HttpContext): Promise<unknown> | unknown;
}
