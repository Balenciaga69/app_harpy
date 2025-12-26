import { AffixEffectAction } from './AffixEffectAction'
import { AffixEffectCondition } from './AffixEffectCondition'
import { AffixEffectTrigger } from './AffixEffectTrigger'

/** 詞綴效果樣板，定義特定效果的觸發、條件與後續動作 */
export interface AffixEffectTemplate {
  readonly id: string
  readonly trigger: AffixEffectTrigger
  readonly conditions: AffixEffectCondition[]
  readonly actions: AffixEffectAction[]
}
