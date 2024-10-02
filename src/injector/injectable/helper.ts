import { MetadataHelper } from '../../metadata/helper.ts';
import { Constructor } from '../../utils/constructor.ts';
import { InjectableOption, injectionData, SCOPE } from './decorator.ts';

/**
 * A helper class for injectable services.
 */
export class InjectableHelper {
	/**
	 * Determines if the given constructor is global.
	 *
	 * @param constructor - The constructor to check.
	 * @returns `true` if the constructor is global, otherwise `false`.
	 */
	static isGlobal(constructor: Constructor): boolean {
		const data = MetadataHelper.getMetadata<InjectableOption>(
			injectionData,
			constructor,
		);
		return !data || !data.scope || data?.scope === SCOPE.GLOBAL;
	}
}
