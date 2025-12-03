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
} from './event-payload'
/**
 * Combat event mapping table
 *
 * Defines all combat-related event names and corresponding Payload types.
 * Ensures type safety when sending and listening to events through TypeScript's type system.
 */
export type CombatEventMap = {
  // === Combat related events ===
  'combat:start': CombatStartPayload
  'combat:end': CombatEndPayload
  'combat:miss': CombatMissPayload
  'combat:prevented': CombatPreventedPayload
  // === Tick related events ===
  'tick:start': TickStartPayload
  'tick:end': TickEndPayload
  'ticker:stopped': TickerStoppedPayload
  // === Entity related events ===
  'entity:damage': EntityDamagePayload
  'entity:heal': EntityHealPayload
  'entity:death': EntityDeathPayload
  'entity:attack': EntityAttackPayload
  'entity:critical': EntityCriticalPayload
  // === Snapshot related events ===
  'tick:snapshot': TickSnapshotPayload
}
