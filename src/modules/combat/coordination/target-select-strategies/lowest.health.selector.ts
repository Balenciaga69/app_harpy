import type { ICharacter } from '../../domain/character'
import type { ITargetSelector } from './target.selector.interface'
/**
 * LowestHealthSelector：最低血量目標選擇策略。
 *
 * 設計理念：
 * - 實現智能化的目標選擇，優先攻擊血量最低的敵人以快速減員。
 * - 適用於需要優先擊殺殘血單位的戰術場景（如收割策略）。
 * - 使用 reduce 遍歷候選列表，比較 currentHp 屬性找出最低血量目標。
 *
 * 主要職責：
 * - 遍歷所有候選目標，比較 currentHp 屬性值。
 * - 返回血量最低的角色作為攻擊目標。
 * - 當列表為空時返回 null，確保邊界情況處理正確。
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
