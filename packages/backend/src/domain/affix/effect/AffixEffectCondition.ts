import { EffectTarget } from '../../../shared/models/EffectTarget'

/** 詞綴效果觸發的條件屬性，用於判斷效果是否應被激活 */
export type AffixEffectConditionProperty = 'HP_PERCENT' | 'ATTACK_COUNTER' | 'DAMAGE_TYPE' | 'ON_EQUIP'

/** 詞綴效果條件的比較操作符，用於條件判定的邏輯 */
export type AffixEffectConditionComparator = 'LESS_THAN' | 'GREATER_THAN' | 'EQUAL_TO' | 'MODULO_IS'

/** 詞綴效果條件，定義效果觸發的限制與判定規則 */
export interface AffixEffectCondition {
  readonly target: EffectTarget
  readonly property: AffixEffectConditionProperty
  readonly comparator: AffixEffectConditionComparator
  readonly value: number | string
}
