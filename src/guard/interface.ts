import { HttpContext } from '../router/router.ts';

export interface AuthGuard {
  canActivate(context: HttpContext): Promise<boolean> | boolean;
}
