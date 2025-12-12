import type { ICharacter } from '../../../character'
import type { CombatStatistics, CharacterStats } from '../../models'
/**
 * StatisticsBuilder
 *
 * Static utility for building combat statistics.
 * TODO: Implement actual calculation logic from logs.
 */
export class StatisticsBuilder {
  /**
   * Build statistics for the combat.
   */
  static build(playerTeam: ICharacter[], enemyTeam: ICharacter[], duration: number): CombatStatistics {
    const allCharacters = [...playerTeam, ...enemyTeam]
    const characterStats = new Map<string, CharacterStats>()
    // Initialize statistics for each character
    allCharacters.forEach((char) => {
      characterStats.set(char.id, {
        characterId: char.id,
        name: char.name,
        damageDealt: 0,
        damageTaken: 0,
        kills: 0,
        survived: !char.isDead,
        attackCount: 0,
        criticalHits: 0,
        dodges: 0,
      })
    })
    // TODO: Statistics calculation logic
    // Need to calculate data from eventLogger logs
    // Suggest implementing StatisticsCalculator class in the future
    const totalDamage = 0
    return {
      characterStats,
      effectsApplied: new Map(),
      totalDamage,
      duration,
    }
  }
}
