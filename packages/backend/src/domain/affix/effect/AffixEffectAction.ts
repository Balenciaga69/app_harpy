import { UnitStatModifierOperation } from '../../stats/StatModifier'
import { UnitStats } from '../../stats/UnitStats'

type StatModifyOperation = UnitStatModifierOperation
export interface StatModifyAction {
  type: 'STAT_MODIFY'
  stat: keyof UnitStats
  operation: StatModifyOperation
  value: number
}

type ApplyStatusId = string | 'charge' | 'poison' | 'chill'
export interface ApplyStatusAction {
  type: 'APPLY_STATUS'
  statusId: ApplyStatusId
  stacks: number
}

export type AffixEffectAction = StatModifyAction | ApplyStatusAction
