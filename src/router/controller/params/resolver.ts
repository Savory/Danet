import { MetadataHelper } from '../../../metadata/helper.ts';
import { ControllerConstructor } from '../constructor.ts';
import {
	Resolver,
} from './decorators.ts';
import { ExecutionContext } from '../../mod.ts';
import { argumentResolverFunctionsMetadataKey } from './constants.ts';

/**
 * Resolves the parameters for a given controller method by using metadata to map
 * parameter indices to resolver functions.
 *
 * @param Controller - The constructor of the controller class.
 * @param ControllerMethod - The method of the controller for which parameters need to be resolved.
 * @param context - The execution context which may be used by resolver functions to resolve parameters.
 * @returns A promise that resolves to an array of parameters for the controller method.
 */
export async function resolveMethodParam(
	Controller: ControllerConstructor,
	// deno-lint-ignore no-explicit-any
	ControllerMethod: (...args: any[]) => unknown,
	context: ExecutionContext,
) {
	const paramResolverMap: Map<number, Resolver> = MetadataHelper.getMetadata(
		argumentResolverFunctionsMetadataKey,
		Controller,
		ControllerMethod.name,
	);
	const params: unknown[] = [];
	if (paramResolverMap) {
		for (const [key, value] of paramResolverMap) {
			params[key] = await value(context);
		}
	}
	return params;
}
