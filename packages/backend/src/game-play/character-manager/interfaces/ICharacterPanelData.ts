import type { BaseAttributeValues } from '../../../features/attribute'
import type { CharacterStatus } from './CharacterStatus'
import type { ICharacterStatistics } from './ICharacterStatistics'

// 角色面板數據介面
export interface ICharacterPanelData {
  basicInfo: {
    id: string
    name: string
    className: string
  }
  attributes: BaseAttributeValues
  equipment: Record<string, unknown> // 裝備槽位映射，具體類型待 Inventory 模組完成
  relics: unknown[] // 遺物實例列表，具體類型待 Inventory 模組完成
  status: CharacterStatus
  statistics: ICharacterStatistics
}
