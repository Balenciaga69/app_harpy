import type { CharacterId } from './entity.types'
/**
 * 角色快照 - 純資料模型
 *
 * 用於記錄某個時間點的角色狀態
 * 主要用於：回放系統、日誌記錄、事件傳遞
 */
export interface CharacterSnapshot {
  id: CharacterId
  name: string
  currentHp: number
  maxHp: number
  isDead: boolean
  effects: string[]
}
