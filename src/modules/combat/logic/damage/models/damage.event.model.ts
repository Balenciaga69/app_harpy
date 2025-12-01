// TODO: [Cross-layer dependency] Logic layer depends on Domain layer's ICharacter interface
// Reason: DamageEvent needs to access character's attributes and status in damage chain
// Migration note: If migrating to strongly typed language (like C#/Go), need to consider:
//   1. Elevate ICharacter to shared contract layer
//   2. Or let DamageEvent only hold CharacterId, query character through Context
import type { ICharacter } from '@/modules/combat/domain/character'
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
