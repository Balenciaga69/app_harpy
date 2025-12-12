import type { ICombatContext } from '../context/ICombatContext'
import type { DamageEvent } from './DamageEvent'

export interface ICombatHook {
  // ?�改?�為 IDamageStep
  beforeDamageCalculation?(event: DamageEvent, context: ICombatContext): DamageEvent
  onHitCheck?(event: DamageEvent, context: ICombatContext): DamageEvent
  onCritCheck?(event: DamageEvent, context: ICombatContext): DamageEvent
  onDamageModify?(event: DamageEvent, context: ICombatContext): DamageEvent
  onDefenseCalculation?(event: DamageEvent, context: ICombatContext): DamageEvent
  beforeDamageApply?(event: DamageEvent, context: ICombatContext): DamageEvent
  afterDamageApply?(event: DamageEvent, context: ICombatContext): void
}
