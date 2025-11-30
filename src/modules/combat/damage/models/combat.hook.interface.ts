import type { CombatContext } from '../../context/combat.context'
import type { DamageEvent } from '..'
export interface ICombatHook {
  beforeDamageCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  onHitCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  onCritCheck?(event: DamageEvent, context: CombatContext): DamageEvent
  onDamageModify?(event: DamageEvent, context: CombatContext): DamageEvent
  onDefenseCalculation?(event: DamageEvent, context: CombatContext): DamageEvent
  beforeDamageApply?(event: DamageEvent, context: CombatContext): DamageEvent
  afterDamageApply?(event: DamageEvent, context: CombatContext): void
}
