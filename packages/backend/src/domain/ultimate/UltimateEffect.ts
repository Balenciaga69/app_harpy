import { EffectTarget } from '../../shared/models/EffectTarget'

/** 最終技能效果的基礎配置，定義效果的目標與倍率 */
interface BaseUltimateEffect {
  readonly type: string
  readonly target: EffectTarget
  readonly ultimateMultiplier?: number
}

/** 最終技能的效果聯合型別，可為汙染花色或汙染點數 */
export type UltimateEffect = PolluteCardsEffect | PolluteRanksEffect

/** 汙染花色效果，使指定花色獲得化學毒素 */
export interface PolluteCardsEffect extends BaseUltimateEffect {
  type: 'polluteCards'
}

/** 汙染點數效果，使指定點數獲得化學毒素 */
export interface PolluteRanksEffect extends BaseUltimateEffect {
  type: 'polluteRanks'
}
