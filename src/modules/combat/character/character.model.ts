// 角色唯一識別
export type CharacterId = string
// 角色類型
export type CharacterType = 'player' | 'enemy'
// 角色介面
export interface ICharacter {
  readonly id: CharacterId
  readonly type: CharacterType
  readonly name: string
}
