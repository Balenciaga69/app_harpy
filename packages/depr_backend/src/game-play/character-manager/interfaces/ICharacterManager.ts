import type { ICharacterInstance } from './ICharacterInstance'
import type { ICharacterPanelData } from './ICharacterPanelData'
import type { ICharacterSelectionResult } from './ICharacterSelectionResult'

/* 角色管理器主要介面 */
export interface ICharacterManager {
  /* 根據角色定義 ID 創建角色實例 */
  createCharacter(characterDefinitionId: string): Promise<ICharacterInstance>

  /* 根據角色 ID 載入角色實例 */
  loadCharacter(characterId: string): Promise<ICharacterInstance>

  /* 儲存角色實例 */
  saveCharacter(character: ICharacterInstance): Promise<void>

  /* 獲取可用角色定義列表 */
  getAvailableCharacters(): unknown[] // 待 Character 模組定義完成後替換

  /* 選擇角色 */
  selectCharacter(characterId: string): Promise<ICharacterSelectionResult>

  /* 獲取角色面板數據 */
  getCharacterPanel(characterId: string): Promise<ICharacterPanelData>

  /* 更新角色狀態 */
  updateCharacterStatus(characterId: string): Promise<void>
}
