export interface IEntity {
  id: string
  name: string
  team: 'player' | 'enemy'
  isDead: boolean
  // 2025/12/01: IEntity differs from ICharacter in that there may be summon creatures or lower beings in the future that cannot share systems with characters
}
