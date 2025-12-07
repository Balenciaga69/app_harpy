import type { CharacterSnapshot } from '../../shared/models'
/**
 * Combat start event
 */
export interface CombatStartPayload {
  tick: number
}
/**
 * Combat end event
 */
export interface CombatEndPayload {
  winner: 'player' | 'enemy' | null
  outcome: 'player-win' | 'enemy-win' | 'draw' | 'timeout'
  tick: number
}
/**
 * Combat miss event (attack missed due to evasion)
 */
export interface CombatMissPayload {
  sourceId: string
  targetId: string
  tick: number
}
/**
 * Combat dodge event (more semantic alias for miss)
 */
export interface CombatDodgePayload {
  sourceId: string
  targetId: string
  tick: number
}
/**
 * Combat attack prevented event
 */
export interface CombatPreventedPayload {
  sourceId: string
  targetId: string
  reason: string
  tick: number
}
/**
 * Tick start event
 */
export interface TickStartPayload {
  tick: number
}
/**
 * Tick end event
 */
export interface TickEndPayload {
  tick: number
}
/**
 * Ticker stopped event
 */
export interface TickerStoppedPayload {
  tick: number
}
/**
 * Entity damage event
 */
export interface EntityDamagePayload {
  sourceId: string
  targetId: string
  amount: number
  finalDamage: number
  isCritical: boolean
  damageType: 'normal' | 'ultimate' | 'effect' | 'true'
  tick: number
}
/**
 * Entity heal event
 */
export interface EntityHealPayload {
  sourceId?: string
  targetId: string
  amount: number
  healType: 'effect' | 'item' | 'regen'
  tick: number
}
/**
 * Entity death event
 */
export interface EntityDeathPayload {
  targetId: string
  killerId?: string
  tick: number
}
/**
 * Entity HP zero event (before death/resurrection check)
 */
export interface EntityHpZeroPayload {
  targetId: string
  attackerId?: string
  tick: number
}
/**
 * Entity resurrection event
 */
export interface EntityResurrectionPayload {
  targetId: string
  restoredHp: number
  restoredHpPercent: number
  tick: number
}
/**
 * Entity attack event
 */
export interface EntityAttackPayload {
  sourceId: string
  targetId: string
  attackType: 'normal' | 'ultimate'
  tick: number
}
/**
 * Entity critical event
 */
export interface EntityCriticalPayload {
  sourceId: string
  targetId: string
  multiplier: number
  tick: number
}
/**
 * Effect applied event
 */
export interface EffectAppliedPayload {
  effectId: string
  effectName: string
  targetId: string
  sourceId?: string
  stacks?: number
  tick: number
}
/**
 * Effect removed event
 */
export interface EffectRemovedPayload {
  effectId: string
  effectName: string
  targetId: string
  reason: 'expired' | 'dispelled' | 'replaced' | 'death'
  tick: number
}
/**
 * Effect tick event (for DOT effects)
 */
export interface EffectTickPayload {
  effectId: string
  effectName: string
  targetId: string
  damage?: number
  heal?: number
  tick: number
}
/**
 * Ultimate used event
 */
export interface UltimateUsedPayload {
  sourceId: string
  ultimateId: string
  ultimateName: string
  targetIds: string[]
  tick: number
}
/**
 * Energy gained event
 */
export interface EnergyGainedPayload {
  targetId: string
  amount: number
  source: 'attack' | 'regen' | 'effect' | 'item'
  currentEnergy: number
  maxEnergy: number
  tick: number
}
/**
 * Tick snapshot event
 */
export interface TickSnapshotPayload {
  tick: number
  entities: CharacterSnapshot[]
}
