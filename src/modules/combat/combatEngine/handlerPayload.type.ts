import type { DamageType } from '../shared/types/stats.type'
import type { EffectType } from '../effect/effect.type'
export interface AttackPayload {
  attackerId: string
  targetId: string
}
export interface DamagePayload {
  targetId: string
  damageType: DamageType
  amount: number
}
export interface DeathPayload {
  characterId: string
}
export interface ApplyEffectPayload {
  targetId: string
  effectType: EffectType
  layers: number
  durationTicks: number
}
export interface MissPayload {
  attackerId: string
  targetId: string
}
