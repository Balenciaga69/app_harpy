import { GameHook } from '../../../shared/models/GameHook'
import { AffixEffectAction } from './AffixEffectAction'
import { AffixEffectCondition } from './AffixEffectCondition'
/** 詞綴效果樣板，定義特定效果的觸發、條件與後續動作 */
export interface AffixEffectTemplate {
  readonly id: string
  readonly trigger: GameHook
  readonly conditions: AffixEffectCondition[]
  readonly actions: AffixEffectAction[]
}
