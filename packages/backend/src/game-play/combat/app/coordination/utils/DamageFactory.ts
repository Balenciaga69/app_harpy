import { ICharacter } from '@/game-play/combat/interfaces/character/ICharacter'
import { DamageEvent } from '@/game-play/combat/interfaces/damage/DamageEvent'
/**
 * DamageFactory
 *
 * Creates damage events for normal attacks and ultimates. Encapsulates event creation logic and supports extension.
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
