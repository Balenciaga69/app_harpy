import type {
  CombatStartPayload,
  CombatEndPayload,
  CombatMissPayload,
  CombatDodgePayload,
  CombatPreventedPayload,
  TickStartPayload,
  TickEndPayload,
  TickerStoppedPayload,
  EntityDamagePayload,
  EntityHealPayload,
  EntityDeathPayload,
  EntityHpZeroPayload,
  EntityResurrectionPayload,
  EntityAttackPayload,
  EntityCriticalPayload,
  EffectAppliedPayload,
  EffectRemovedPayload,
  EffectTickPayload,
  UltimateUsedPayload,
  EnergyGainedPayload,
  TickSnapshotPayload,
} from './EventPayload'
export type CombatEventMap = {
  // === Combat related events ===
  'combat:start': CombatStartPayload
  'combat:end': CombatEndPayload
  'combat:miss': CombatMissPayload
  'combat:dodge': CombatDodgePayload
  'combat:prevented': CombatPreventedPayload
  // === Tick related events ===
  'tick:start': TickStartPayload
  'tick:end': TickEndPayload
  'ticker:stopped': TickerStoppedPayload
  // === Entity related events ===
  'entity:damage': EntityDamagePayload
  'entity:heal': EntityHealPayload
  'entity:death': EntityDeathPayload
  'entity:hp-zero': EntityHpZeroPayload
  'entity:resurrection': EntityResurrectionPayload
  'entity:attack': EntityAttackPayload
  'entity:critical': EntityCriticalPayload
  // === Effect related events ===
  'effect:applied': EffectAppliedPayload
  'effect:removed': EffectRemovedPayload
  'effect:tick': EffectTickPayload
  // === Ultimate related events ===
  'ultimate:used': UltimateUsedPayload
  // === Energy related events ===
  'energy:gained': EnergyGainedPayload
  // === Snapshot related events ===
  'tick:snapshot': TickSnapshotPayload
}
