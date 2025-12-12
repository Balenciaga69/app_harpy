export interface IEntity {
  id: string
  name: string
  team: 'player' | 'enemy'
  isDead: boolean
}
