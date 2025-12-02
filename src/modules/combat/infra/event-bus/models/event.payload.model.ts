import type { CharacterSnapshot } from '../../shared/models'
/**
 * Combat start event
 */
export interface CombatStartPayload {
  // No payload for now
}
/**
 * Combat end event
 */
export interface CombatEndPayload {
  winnerId: string
}
/**
 * Combat miss event
 */
export interface CombatMissPayload {
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
  targetId: string
  amount: number
  sourceId?: string
}
/**
 * Entity heal event
 */
export interface EntityHealPayload {
  targetId: string
  amount: number
}
/**
 * Entity death event
 */
export interface EntityDeathPayload {
  targetId: string
}
/**
 * Entity attack event
 */
export interface EntityAttackPayload {
  sourceId: string
  targetId: string
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
 * Tick snapshot event
 */
export interface TickSnapshotPayload {
  tick: number
  entities: CharacterSnapshot[]
}
