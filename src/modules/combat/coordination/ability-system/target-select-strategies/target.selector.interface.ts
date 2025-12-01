import type { ICharacter } from '@/modules/combat/domain/character'

/**
 * Target selector strategy interface
 */
export interface ITargetSelector {
  /**
   * Select one attack target from candidate targets
   */
  selectTarget(attacker: ICharacter, candidates: ICharacter[]): ICharacter | null
}
