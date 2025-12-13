import type { ICharacter } from '../../interfaces/character/ICharacter'
import type { ITargetSelector } from '../../interfaces/target-select-strategies/ITargetSelector'
/**
 * FirstAliveSelector
 *
 * Selects the first alive enemy from candidate list. Implements ITargetSelector.
 */
export class FirstAliveSelector implements ITargetSelector {
  selectTarget(_attacker: ICharacter, candidates: ICharacter[]): ICharacter | null {
    return candidates[0] ?? null
  }
}
