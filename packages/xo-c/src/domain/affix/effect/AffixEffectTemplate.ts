import { GameHook } from '../../../shared/models/GameHook'
import { AffixEffectAction } from './AffixEffectAction'
import { AffixEffectCondition } from './AffixEffectCondition'
export interface AffixEffect {
  readonly id: string
  readonly trigger: GameHook
  readonly conditions: AffixEffectCondition[]
  readonly actions: AffixEffectAction[]
}
