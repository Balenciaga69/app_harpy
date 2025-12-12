import type { ICharacter } from '../../../character'
/**
 * SurvivorCollector
 *
 * Static utility for collecting surviving characters from teams.
 */
export class SurvivorCollector {
  /** Get all surviving characters from both teams.*/
  static collect(playerTeam: ICharacter[], enemyTeam: ICharacter[]): ICharacter[] {
    return [...playerTeam, ...enemyTeam].filter((c) => !c.isDead)
  }
}
