import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from './damage-event'

export interface ICombatHook {
  // 應改名為 IDamageStep
  beforeDamageCalculation?(event: DamageEvent, context: ICombatContext): DamageEvent
  onHitCheck?(event: DamageEvent, context: ICombatContext): DamageEvent
  onCritCheck?(event: DamageEvent, context: ICombatContext): DamageEvent
  onDamageModify?(event: DamageEvent, context: ICombatContext): DamageEvent
  onDefenseCalculation?(event: DamageEvent, context: ICombatContext): DamageEvent
  beforeDamageApply?(event: DamageEvent, context: ICombatContext): DamageEvent
  afterDamageApply?(event: DamageEvent, context: ICombatContext): void
}
