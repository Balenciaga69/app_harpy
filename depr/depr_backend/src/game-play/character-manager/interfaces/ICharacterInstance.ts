import type { BaseAttributeValues } from '../../../features/attribute'
import type { CharacterStatus } from './CharacterStatus'

// 角色實例介面
export interface ICharacterInstance {
  id: string
  definitionId: string
  currentAttributes: BaseAttributeValues
  inventoryId: string
  status: CharacterStatus
  createdAt: Date
  updatedAt: Date
}
