import type { ICharacter } from '@/logic/combat/domain/character'
/**
 * Damage event - process data model
 *
 * This is not a pure data model, but a carrier passed in DamageChain process
 * Contains references to entities, so depends on Domain layer
 *
 * Design principles:
 * - Unified use of pure damage (amount)
 * - Support true damage (isTrueDamage)
 * - Support ultimate marking (isUltimate)
 */
export interface DamageEvent {
  // === Basic information ===
  /** Attacker */
  source: ICharacter
  /** Target */
  target: ICharacter
  // === Damage values ===
  /** Base damage value */
  amount: number
  /** Final total damage */
  finalDamage: number
  // === Marks ===
  /** Whether ultimate */
  isUltimate: boolean
  /** Whether true damage (ignores defense) */
  isTrueDamage: boolean
  // === Hit and critical ===
  /** Whether critical */
  isCrit: boolean
  /** Whether hit (false = dodged) */
  isHit: boolean
  // === Metadata ===
  /** Which tick occurred */
  tick: number
  /** Whether completely prevented (e.g. immunity) */
  prevented: boolean
}
