import type { CharacterId, CharacterSnapshot } from '../../shared/models'
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
  sourceId: CharacterId
  targetId: CharacterId
  tick: number
}
/**
 * Combat attack prevented event
 */
export interface CombatPreventedPayload {
  sourceId: CharacterId
  targetId: CharacterId
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
  targetId: CharacterId
  amount: number
  sourceId?: CharacterId
}
/**
 * Entity heal event
 */
export interface EntityHealPayload {
  targetId: CharacterId
  amount: number
}
/**
 * Entity death event
 */
export interface EntityDeathPayload {
  targetId: CharacterId
}
/**
 * Entity attack event
 */
export interface EntityAttackPayload {
  sourceId: CharacterId
  targetId: CharacterId
  tick: number
}
/**
 * Entity critical event
 */
export interface EntityCriticalPayload {
  sourceId: CharacterId
  targetId: CharacterId
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
