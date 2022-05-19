import { MetadataHelper } from '../../metadata/helper.ts';
import { Constructor } from '../../utils/constructor.ts';
import { InjectableOption, injectionData, SCOPE } from './decorator.ts';

export class InjectableHelper {
	static isGlobal(constructor: Constructor) {
		const data = MetadataHelper.getMetadata<InjectableOption>(
			injectionData,
			constructor,
		);
		return !data || !data.scope || data?.scope === SCOPE.GLOBAL;
	}
}
