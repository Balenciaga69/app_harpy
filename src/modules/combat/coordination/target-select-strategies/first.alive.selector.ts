import type { ICharacter } from '../../domain/character'
import type { ITargetSelector } from './target.selector.interface'
/**
 * FirstAliveSelector：第一存活目標選擇策略。
 *
 * 設計理念：
 * - 實現最簡單的目標選擇邏輯，總是選擇候選列表中的第一個目標。
 * - 適用於前排優先、位置敏感的戰鬥場景。
 * - 作為預設策略使用，確保系統在無特殊需求時有穩定的選擇行為。
 *
 * 主要職責：
 * - 從候選目標列表中返回索引為 0 的角色。
 * - 當列表為空時返回 null，確保不會選擇到無效目標。
 */
export class FirstAliveSelector implements ITargetSelector {
  selectTarget(_attacker: ICharacter, candidates: ICharacter[]): ICharacter | null {
    return candidates[0] ?? null
  }
}
