export type AffixEffectConditionTarget = 'TARGET' | 'SELF'
export type AffixEffectConditionProperty = 'HP_PERCENT' | 'ATTACK_COUNTER'
export type AffixEffectConditionComparator = 'LESS_THAN' | 'GREATER_THAN' | 'EQUAL_TO' | 'MODULO_IS'
export interface AffixEffectCondition {
  readonly target: AffixEffectConditionTarget
  readonly property: AffixEffectConditionProperty
  readonly comparator: AffixEffectConditionComparator
  readonly value: number
}
