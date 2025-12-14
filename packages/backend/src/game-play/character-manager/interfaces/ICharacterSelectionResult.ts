import type { ICharacterInstance } from './ICharacterInstance'

// 角色選擇結果介面
export interface ICharacterSelectionResult {
  success: boolean
  character?: ICharacterInstance
  errorMessage?: string
}
