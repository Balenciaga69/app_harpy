import { AffixTemplate } from '../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../domain/affix/effect/AffixEffectTemplate'

export interface AffixConfigDTO {
  affixTemplates: AffixTemplate[]
  affixEffectTemplates: AffixEffectTemplate[]
}

export interface IAffixConfigLoader {
  load(): Promise<AffixConfigDTO>
}
