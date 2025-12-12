import type { ICharacter } from '@/features/combat/character'
/**
 * Target selector strategy interface
 */
export interface ITargetSelector {
  /**
   * Select one attack target from candidate targets
   */
  selectTarget(attacker: ICharacter, candidates: ICharacter[]): ICharacter | null
}
