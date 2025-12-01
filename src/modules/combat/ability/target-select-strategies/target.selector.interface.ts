import type { ICharacter } from '../../character'
/**
 * 目標選擇策略介面
 */
export interface ITargetSelector {
  /**
   * 從候選目標中選擇一個攻擊目標
   */
  selectTarget(attacker: ICharacter, candidates: ICharacter[]): ICharacter | null
}
