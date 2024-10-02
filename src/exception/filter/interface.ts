import { HttpContext } from '../../router/router.ts';

/**
 * Interface representing an exception filter.
 * 
 * This interface defines a method to handle exceptions that occur within an HTTP context.
 * Implementations of this interface can provide custom logic for handling different types of exceptions.
 * 
 * @interface ExceptionFilter
 */
export interface ExceptionFilter {
	catch(
		exception: unknown,
		context: HttpContext,
	): undefined | Response | { topic: string; data: unknown };
}
