import type {
  CombatStartPayload,
  CombatEndPayload,
  CombatMissPayload,
  CombatPreventedPayload,
  TickStartPayload,
  TickEndPayload,
  TickerStoppedPayload,
  EntityDamagePayload,
  EntityHealPayload,
  EntityDeathPayload,
  EntityAttackPayload,
  EntityCriticalPayload,
  TickSnapshotPayload,
} from './event.payload.model'
/**
 * 戰鬥事件映射表
 *
 * 定義所有戰鬥相關事件的名稱與對應的 Payload 類型。
 * 通過 TypeScript 的類型系統確保事件發送與監聽時的類型安全。
 */
export type CombatEventMap = {
  // === Combat 相關事件 ===
  'combat:start': CombatStartPayload
  'combat:end': CombatEndPayload
  'combat:miss': CombatMissPayload
  'combat:prevented': CombatPreventedPayload
  // === Tick 相關事件 ===
  'tick:start': TickStartPayload
  'tick:end': TickEndPayload
  'ticker:stopped': TickerStoppedPayload
  // === Entity 相關事件 ===
  'entity:damage': EntityDamagePayload
  'entity:heal': EntityHealPayload
  'entity:death': EntityDeathPayload
  'entity:attack': EntityAttackPayload
  'entity:critical': EntityCriticalPayload
  // === Snapshot 相關事件 ===
  'tick:snapshot': TickSnapshotPayload
}
