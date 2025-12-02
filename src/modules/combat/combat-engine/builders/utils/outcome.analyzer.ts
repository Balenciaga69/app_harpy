import type { ICharacter } from '../../../domain/character'
import type { CombatOutcome } from '../../models'

/**
 * OutcomeAnalyzer
 *
 * Static utility for analyzing combat outcome based on team states and ticks.
 */
export class OutcomeAnalyzer {
  /**
   * Analyze the outcome of a combat.
   */
  static analyze(
    playerTeam: ICharacter[],
    enemyTeam: ICharacter[],
    currentTick: number,
    maxTicks: number
  ): { outcome: CombatOutcome; winner: 'player' | 'enemy' | null } {
    const playerAlive = playerTeam.some((c) => !c.isDead)
    const enemyAlive = enemyTeam.some((c) => !c.isDead)
    const reachedMaxTicks = currentTick >= maxTicks

    if (playerAlive && !enemyAlive) {
      return { outcome: 'player-win', winner: 'player' }
    }
    if (!playerAlive && enemyAlive) {
      return { outcome: 'enemy-win', winner: 'enemy' }
    }
    if (!playerAlive && !enemyAlive) {
      return { outcome: 'draw', winner: null }
    }
    if (reachedMaxTicks) {
      return { outcome: 'timeout', winner: null }
    }
    // Default case (should not happen)
    return { outcome: 'draw', winner: null }
  }
}
