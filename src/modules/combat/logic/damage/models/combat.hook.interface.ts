// TODO: [Cross-layer dependency] Logic layer depends on Context layer's ICombatContext
// Reason: Hook needs to access combat context to query or modify status
// Migration note: If migrating to strongly typed language, need to elevate ICombatContext interface to shared contract
import type { ICombatContext } from '@/modules/combat/context'
import type { DamageEvent } from './damage.event.model'
/**
 * Combat Hook interface - behavior contract
 *
 * Define various extensible points in damage calculation process
 * Allow characters, equipment, effects, etc. to inject custom logic
 */
export interface ICombatHook {
  beforeDamageCalculation?(event: DamageEvent, context: ICombatContext): DamageEvent
  onHitCheck?(event: DamageEvent, context: ICombatContext): DamageEvent
  onCritCheck?(event: DamageEvent, context: ICombatContext): DamageEvent
  onDamageModify?(event: DamageEvent, context: ICombatContext): DamageEvent
  onDefenseCalculation?(event: DamageEvent, context: ICombatContext): DamageEvent
  beforeDamageApply?(event: DamageEvent, context: ICombatContext): DamageEvent
  afterDamageApply?(event: DamageEvent, context: ICombatContext): void
}
