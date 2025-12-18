import { EffectTarget } from '../../shared/models/EffectTarget'
import { AilmentId } from '../ailment/AilmentId'

interface BaseUltimateEffect {
  readonly type: string
  readonly target: EffectTarget
  readonly ultimateMultiplier?: number
}

export type UltimateEffect =
  | DamageEffect
  | NextHitEnergyGainEffect
  | ApplyAilmentEffect
  | ApplyAilmentEqualSumEffect
  | AddStatEffect
  | NextUltimateDamageReductionEffect

export interface DamageEffect extends BaseUltimateEffect {
  type: 'damage'
  value: number
}

export interface NextHitEnergyGainEffect extends BaseUltimateEffect {
  type: 'nextHitEnergyGain'
  energyGain: number
  hitCount: number
}

export interface ApplyAilmentEffect extends BaseUltimateEffect {
  type: 'applyAilment'
  ailment: AilmentId
  layers: number
}

export interface ApplyAilmentEqualSumEffect extends BaseUltimateEffect {
  type: 'applyAilmentEqualSum'
  ailments: AilmentId[]
  applyTo: AilmentId
}

export interface AddStatEffect extends BaseUltimateEffect {
  type: 'addStat'
  stat: string
  value: number
  duration: number // ticks
}

export interface NextUltimateDamageReductionEffect extends BaseUltimateEffect {
  type: 'nextUltimateDamageReduction'
  reduction: number // 0.5 = 減免50%
  duration: number // ticks
}
