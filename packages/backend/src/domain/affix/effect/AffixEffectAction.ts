import { EffectTarget } from '../../../shared/models/EffectTarget'
import { AilmentId } from '../../ailment/AilmentId'
import { UnitStatModifierOperation } from '../../stats/models/StatModifier'
import { UnitStats } from '../../stats/models/UnitStats'

interface BaseAffixEffectAction {
  readonly type: string
  readonly affixMultiplier?: number
}

export interface StatModifyAction extends BaseAffixEffectAction {
  readonly type: 'STAT_MODIFY'
  readonly stat: keyof UnitStats
  readonly operation: UnitStatModifierOperation
  readonly value: number
}

export interface ApplyStatusAction extends BaseAffixEffectAction {
  readonly type: 'APPLY_STATUS'
  readonly ailmentId: AilmentId
  readonly target: EffectTarget
  readonly stacks: number
}

export type AffixEffectAction = StatModifyAction | ApplyStatusAction
