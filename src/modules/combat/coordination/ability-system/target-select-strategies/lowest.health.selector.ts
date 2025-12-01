import type { ICharacter } from '@/modules/combat/domain/character'
import type { ITargetSelector } from './target.selector.interface'
/**
 * LowestHealthSelector: Lowest health target selection strategy.
 *
 * Design concept:
 * - Implements intelligent target selection, prioritizes attacking enemies with lowest health to quickly reduce numbers.
 * - Suitable for tactical scenarios that need to prioritize killing low-health units (like harvesting strategy).
 * - Uses reduce to iterate through candidate list, compares currentHp attribute to find lowest health target.
 *
 * Main responsibilities:
 * - Iterate through all candidate targets, compare currentHp attribute values.
 * - Return character with lowest health as attack target.
 * - Return null when list is empty, ensuring correct boundary case handling.
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
