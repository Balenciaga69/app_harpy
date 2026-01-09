import { EffectTarget } from '../../shared/models/EffectTarget'

export type UltimateEffectType = 'polluteCards' | 'polluteRanks'

interface BaseUltimateEffect {
  readonly type: UltimateEffectType
  readonly target: EffectTarget
  readonly ultimateMultiplier?: number
}

export type UltimateEffect = PolluteCardsEffect | PolluteRanksEffect

export interface PolluteCardsEffect extends BaseUltimateEffect {
  type: 'polluteCards'
}

export interface PolluteRanksEffect extends BaseUltimateEffect {
  type: 'polluteRanks'
}
