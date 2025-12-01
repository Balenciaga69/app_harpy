// TODO: [Cross-layer dependency] Logic layer depends on Context layer's CombatContext
// Reason: Hook needs to access combat context to query or modify status
// Migration note: If migrating to strongly typed language, need to elevate CombatContext interface to shared contract
import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '..'
/**
 * Combat Hook interface - behavior contract
 *
 * Define various extensible points in damage calculation process
 * Allow characters, equipment, effects, etc. to inject custom logic
 */
export interface ICombatHook {
  beforeDamageCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  onHitCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  onCritCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  onDamageModify?(event: DamageEvent, context: CombatContext): DamageEvent
  onDefenseCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  beforeDamageApply?(event: DamageEvent, context: CombatContext): DamageEvent
  afterDamageApply?(event: DamageEvent, context: CombatContext): void
}
