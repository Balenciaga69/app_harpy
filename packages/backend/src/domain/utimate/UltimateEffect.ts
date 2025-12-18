import { AlimentId } from '../ailment/AlimentId'

export type UltimateEffect =
  | DamageEffect
  | NextHitEnergyGainEffect
  | ApplyAilmentEffect
  | ApplyAilmentEqualSumEffect
  | AddStatEffect
  | NextUltimateDamageReductionEffect

export interface DamageEffect {
  type: 'damage'
  target: 'lowestHpEnemy' | 'allEnemies' | 'enemy' | 'self' | string
  value: number
}

export interface NextHitEnergyGainEffect {
  type: 'nextHitEnergyGain'
  target: 'self' | string
  energyGain: number
  hitCount: number
}

export interface ApplyAilmentEffect {
  type: 'applyAilment'
  target: 'enemy'
  ailment: AlimentId
  layers: number
}

export interface ApplyAilmentEqualSumEffect {
  type: 'applyAilmentEqualSum'
  target: 'enemy'
  ailments: AlimentId[]
  applyTo: AlimentId
}

export interface AddStatEffect {
  type: 'addStat'
  target: 'self' | string
  stat: string
  value: number
  duration: number // ticks
}

export interface NextUltimateDamageReductionEffect {
  type: 'nextUltimateDamageReduction'
  target: 'enemy' | string
  reduction: number // 0.5 = 減免50%
  duration: number // ticks
  exclude?: string[] // 排除傷害類型
}
