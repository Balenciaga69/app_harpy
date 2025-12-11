/**
 * CharacterStats
 *
 * Records detailed data for a single character in combat.
 */
export interface CharacterStats {
  /** Character ID */
  characterId: string
  /** Character name */
  name: string
  /** Total damage dealt */
  damageDealt: number
  /** Total damage taken */
  damageTaken: number
  /** Number of kills */
  kills: number
  /** Whether survived */
  survived: boolean
  /** Number of attacks */
  attackCount: number
  /** Number of critical hits */
  criticalHits: number
  /** Number of dodges */
  dodges: number
}
