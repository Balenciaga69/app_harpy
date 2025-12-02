import type { ICharacter } from '@/modules/combat/domain/character'
import type { ITargetSelector } from './target.selector.interface'
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
