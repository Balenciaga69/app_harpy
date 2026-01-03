import type { ICharacterInstance } from './ICharacterInstance'

// 角色管理器事件定義
export interface ICharacterManagerEvents {
  'character:created': { character: ICharacterInstance }
  'character:loaded': { character: ICharacterInstance }
  'character:saved': { characterId: string }
  'character:selected': { character: ICharacterInstance }
  'character:status-changed': {
    characterId: string
    oldStatus: string
    newStatus: string
  }
  'character:updated': { characterId: string }
}
