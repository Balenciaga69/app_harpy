import type { CharacterId } from '../interfaces/character.interface'
export interface CharacterSnapshot {
  id: CharacterId
  name: string
  currentHp: number
  maxHp: number
  isDead: boolean
  effects: string[] // 效果名稱列表
}
