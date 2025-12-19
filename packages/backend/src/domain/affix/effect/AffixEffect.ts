import { AffixEffectAction } from './AffixEffectAction'
import { AffixEffectCondition } from './AffixEffectCondition'
import { AffixEffectTrigger } from './AffixEffectTrigger'

export interface AffixEffect {
  readonly id: string
  readonly trigger: AffixEffectTrigger
  readonly conditions: AffixEffectCondition[]
  readonly actions: AffixEffectAction[]
}
