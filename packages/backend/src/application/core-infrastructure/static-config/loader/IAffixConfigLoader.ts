import { AffixTemplate } from '../../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../../domain/affix/effect/AffixEffectTemplate'

/** 詞綴配置資料傳輸物件 */
export interface AffixConfigDTO {
  affixTemplates: AffixTemplate[]
  affixEffectTemplates: AffixEffectTemplate[]
}

/** 詞綴配置加載器介面 */
export interface IAffixConfigLoader {
  /** 加載詞綴配置 */
  load(): Promise<AffixConfigDTO>
}
