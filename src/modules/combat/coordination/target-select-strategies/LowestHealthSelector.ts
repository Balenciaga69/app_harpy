import type { ICharacter } from '@/modules/combat/domain/character'
import type { ITargetSelector } from './target-selector'
/**
 * LowestHealthSelector
 *
 * Selects the enemy with lowest health from candidate list. Implements ITargetSelector.
 */
export class LowestHealthSelector implements ITargetSelector {
  selectTarget(_attacker: ICharacter, candidates: ICharacter[]): ICharacter | null {
    if (candidates.length === 0) return null
    return candidates.reduce((lowest, current) => {
      const lowestHp = lowest.getAttribute('currentHp')
      const currentHp = current.getAttribute('currentHp')
      return currentHp < lowestHp ? current : lowest
    })
  }
}
