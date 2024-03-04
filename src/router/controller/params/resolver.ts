import { MetadataHelper } from '../../../metadata/helper.ts';
import { ControllerConstructor } from '../constructor.ts';
import { Resolver, argumentResolverFunctionsMetadataKey } from './decorators.ts';
import { ExecutionContext } from '../../mod.ts';

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