import {
  AffixConfigDTO,
  IAffixConfigLoader,
} from '../../application/core-infrastructure/static-config/loader/IAffixConfigLoader'
import { AffixEffectTemplateList, AffixTemplateList } from '../../data/affix/affix.data'
export class InternalAffixConfigLoader implements IAffixConfigLoader {
  async load(): Promise<AffixConfigDTO> {
    const dto: AffixConfigDTO = {
      affixTemplates: AffixTemplateList,
      affixEffectTemplates: AffixEffectTemplateList,
    }
    return Promise.resolve(dto)
  }
}
