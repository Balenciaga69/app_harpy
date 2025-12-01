import type { CharacterId } from '../../domain/character'
/**
 * CharacterStats
 *
 * Records detailed data for a single character in combat.
 */
export interface CharacterStats {
  /** Character ID */
  characterId: CharacterId
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
/**
 * CombatStatistics
 *
 * Aggregates statistics for the entire combat.
 *
 * TODO: Statistics calculation logic
 * Currently, statistics are empty shells and need to be calculated from EventLogger logs.
 * Suggest implementing a StatisticsCalculator class in the future to iterate through event logs and accumulate:
 * - damageDealt/damageTaken: listen to 'entity:damage' events
 * - kills: listen to 'entity:death' events
 * - criticalHits: listen to 'entity:critical' events
 * - dodges: listen to 'combat:miss' events
 * - effectsApplied: listen to 'entity:effect-applied' events
 */
export interface CombatStatistics {
  /** Statistics for each character */
  characterStats: Map<CharacterId, CharacterStats>
  /** Effect application statistics */
  effectsApplied: Map<string, number> // effectName -> count
  /** Total damage */
  totalDamage: number
  /** Combat duration in ticks */
  duration: number
}
