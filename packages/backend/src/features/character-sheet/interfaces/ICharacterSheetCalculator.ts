import type { ICharacterSheet } from './ICharacterSheet'
import type { ICharacterSheetInput } from './ICharacterSheetInput'
/**
 * 角色面板計算器介面
 *
 * 負責將角色基礎屬性、裝備、遺物計算成最終角色面板
 */
export interface ICharacterSheetCalculator {
  /**
   * 計算角色面板
   * @param input 角色面板輸入（基礎屬性、裝備、遺物）
   * @returns 計算後的完整角色面板
   */
  calculate(input: ICharacterSheetInput): ICharacterSheet
}
