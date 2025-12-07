import type { ICharacter } from '@/logic/combat/domain/character'
/**
 * Target selector strategy interface
 */
export interface ITargetSelector {
  /**
   * Select one attack target from candidate targets
   */
  selectTarget(attacker: ICharacter, candidates: ICharacter[]): ICharacter | null
}
