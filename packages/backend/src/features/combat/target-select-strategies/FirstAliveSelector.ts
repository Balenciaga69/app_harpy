import type { ICharacter } from '@/features/combat/character'
import type { ITargetSelector } from './target-selector'
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
