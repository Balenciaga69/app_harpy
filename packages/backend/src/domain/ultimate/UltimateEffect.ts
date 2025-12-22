import { EffectTarget } from '../../shared/models/EffectTarget'

interface BaseUltimateEffect {
  readonly type: string
  readonly target: EffectTarget
  readonly ultimateMultiplier?: number
}

export type UltimateEffect = PolluteCardsEffect | PolluteRanksEffect

/** 汙染某個花色, 使其獲得化學毒素 */
export interface PolluteCardsEffect extends BaseUltimateEffect {
  type: 'polluteCards'
}

/** 汙染某個點數, 使其獲得化學毒素 */
export interface PolluteRanksEffect extends BaseUltimateEffect {
  type: 'polluteRanks'
}
