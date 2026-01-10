import type { ICharacterPanelData } from './ICharacterPanelData'

/* 角色面板計算器介面 */
export interface ICharacterPanelCalculator {
  /* 計算並生成角色面板數據 */
  calculatePanel(characterId: string): Promise<ICharacterPanelData>
}
