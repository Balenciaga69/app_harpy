import type { CharacterId, CharacterSnapshot } from '../../shared/models'
/**
 * 戰鬥開始事件
 */
export interface CombatStartPayload {
  // 暫無 payload
}
/**
 * 戰鬥結束事件
 */
export interface CombatEndPayload {
  winnerId: string
}
/**
 * 戰鬥未命中事件
 */
export interface CombatMissPayload {
  sourceId: CharacterId
  targetId: CharacterId
  tick: number
}
/**
 * 戰鬥攻擊被阻止事件
 */
export interface CombatPreventedPayload {
  sourceId: CharacterId
  targetId: CharacterId
  reason: string
  tick: number
}
/**
 * Tick 開始事件
 */
export interface TickStartPayload {
  tick: number
}
/**
 * Tick 結束事件
 */
export interface TickEndPayload {
  tick: number
}
/**
 * Ticker 停止事件
 */
export interface TickerStoppedPayload {
  tick: number
}
/**
 * 實體傷害事件
 */
export interface EntityDamagePayload {
  targetId: CharacterId
  amount: number
  sourceId?: CharacterId
}
/**
 * 實體治療事件
 */
export interface EntityHealPayload {
  targetId: CharacterId
  amount: number
}
/**
 * 實體死亡事件
 */
export interface EntityDeathPayload {
  targetId: CharacterId
}
/**
 * 實體攻擊事件
 */
export interface EntityAttackPayload {
  sourceId: CharacterId
  targetId: CharacterId
  tick: number
}
/**
 * 實體暴擊事件
 */
export interface EntityCriticalPayload {
  sourceId: CharacterId
  targetId: CharacterId
  multiplier: number
  tick: number
}
/**
 * Tick 快照事件
 */
export interface TickSnapshotPayload {
  tick: number
  entities: CharacterSnapshot[]
}
