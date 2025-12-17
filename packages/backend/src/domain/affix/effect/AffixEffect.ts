import { AffixEffectAction } from './AffixEffectAction'
import { AffixEffectCondition } from './AffixEffectCondition'
import { AffixEffectTrigger } from './AffixEffectTrigger'

export interface AffixEffect {
  id: string
  trigger: AffixEffectTrigger
  conditions: AffixEffectCondition[]
  actions: AffixEffectAction[]
}
