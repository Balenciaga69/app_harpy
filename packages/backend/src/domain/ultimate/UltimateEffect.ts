import { EffectTarget } from '../../shared/models/EffectTarget'

/** 大絕招效果的基礎配置，定義效果的目標與倍率 */
interface BaseUltimateEffect {
  readonly type: string
  readonly target: EffectTarget
  readonly ultimateMultiplier?: number
}

/** 大絕招的效果聯合型別 */
export type UltimateEffect = PolluteCardsEffect | PolluteRanksEffect

/** 汙染花色效果，使指定花色獲得化學毒素 */
export interface PolluteCardsEffect extends BaseUltimateEffect {
  type: 'polluteCards'
}

/** 汙染點數效果，使指定點數獲得化學毒素 */
export interface PolluteRanksEffect extends BaseUltimateEffect {
  type: 'polluteRanks'
}
