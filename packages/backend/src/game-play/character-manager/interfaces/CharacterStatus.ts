// 角色狀態常數
export const CharacterStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  IN_COMBAT: 'IN_COMBAT',
  DEAD: 'DEAD',
} as const

// 角色狀態型別
export type CharacterStatus = (typeof CharacterStatus)[keyof typeof CharacterStatus]
