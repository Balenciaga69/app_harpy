import { AlimentId } from '../../ailment/AlimentId'
import { UnitStatModifierOperation } from '../../stats/StatModifier'
import { UnitStats } from '../../stats/UnitStats'

type StatModifyOperation = UnitStatModifierOperation
export interface StatModifyAction {
  type: 'STAT_MODIFY'
  stat: keyof UnitStats
  operation: StatModifyOperation
  value: number
}

export interface ApplyStatusAction {
  type: 'APPLY_STATUS'
  alimentId: AlimentId
  stacks: number
}

export type AffixEffectAction = StatModifyAction | ApplyStatusAction
