import { EffectTarget } from '../../../shared/models/EffectTarget'
import { AilmentId } from '../../ailment/AilmentId'
import { UnitStatModifierOperation } from '../../stats/models/StatModifier'
import { UnitStats } from '../../stats/models/UnitStats'

interface BaseAffixEffectAction {
  type: string
  affixMultiplier?: number
}

export interface StatModifyAction extends BaseAffixEffectAction {
  type: 'STAT_MODIFY'
  stat: keyof UnitStats
  operation: UnitStatModifierOperation
  value: number
}

export interface ApplyStatusAction extends BaseAffixEffectAction {
  type: 'APPLY_STATUS'
  ailmentId: AilmentId
  target: EffectTarget
  stacks: number
}

export type AffixEffectAction = StatModifyAction | ApplyStatusAction
