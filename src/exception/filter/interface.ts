import { HttpContext } from '../../router/router.ts';

export interface ExceptionFilter {
	catch(exception: unknown, context: HttpContext): undefined | Response;
}
