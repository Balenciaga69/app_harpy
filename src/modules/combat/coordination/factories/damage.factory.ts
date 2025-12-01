import type { ICharacter } from '../../domain/character'
import type { DamageEvent } from '../../logic/damage'
/**
 * DamageFactory: Damage event creation factory.
 *
 * Design concept:
 * - Supports normal attack and ultimate two damage types
 * - Supports true damage (ignores defense) marking
 * - Provides unified DamageEvent structure
 *
 * Main responsibilities:
 * - Create damage events for standard attacks (from attackDamage attribute)
 * - Create damage events for ultimates (isUltimate = true)
 * - Create true damage events (isTrueDamage = true, ignores all reductions)
 * - Initialize default state for damage events
 */
export class DamageFactory {
  /** Create normal attack damage event */
  createAttackEvent(source: ICharacter, target: ICharacter, tick: number): DamageEvent {
    const baseDamage = source.getAttribute('attackDamage') ?? 0
    return {
      source,
      target,
      amount: baseDamage,
      finalDamage: 0,
      isCrit: false,
      isHit: true,
      isUltimate: false,
      isTrueDamage: false,
      tick,
      prevented: false,
    }
  }
  /** Create ultimate damage event */
  createUltimateEvent(source: ICharacter, target: ICharacter, damageAmount: number, tick: number): DamageEvent {
    return {
      source,
      target,
      amount: damageAmount,
      finalDamage: 0,
      isCrit: false,
      isHit: true,
      isUltimate: true,
      isTrueDamage: false,
      tick,
      prevented: false,
    }
  }
  /** Create true damage event (ignores defense) */
  createTrueDamageEvent(source: ICharacter, target: ICharacter, damageAmount: number, tick: number): DamageEvent {
    return {
      source,
      target,
      amount: damageAmount,
      finalDamage: damageAmount, // True damage equals final damage directly
      isCrit: false,
      isHit: true,
      isUltimate: false,
      isTrueDamage: true,
      tick,
      prevented: false,
    }
  }
}
