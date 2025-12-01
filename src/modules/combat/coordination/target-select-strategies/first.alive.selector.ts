import type { ICharacter } from '../../domain/character'
import type { ITargetSelector } from './target.selector.interface'
/**
 * FirstAliveSelector: First alive target selection strategy.
 *
 * Design concept:
 * - Implements simplest target selection logic, always selects first target in candidate list.
 * - Suitable for front-line priority, position-sensitive combat scenarios.
 * - Used as default strategy to ensure stable selection behavior when no special requirements.
 *
 * Main responsibilities:
 * - Return character at index 0 from candidate target list.
 * - Return null when list is empty, ensuring no invalid target is selected.
 */
export class FirstAliveSelector implements ITargetSelector {
  selectTarget(_attacker: ICharacter, candidates: ICharacter[]): ICharacter | null {
    return candidates[0] ?? null
  }
}
