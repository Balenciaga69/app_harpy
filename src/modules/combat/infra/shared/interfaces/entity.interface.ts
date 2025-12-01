export interface IEntity {
  id: string
  name: string
  team: 'player' | 'enemy'
  isDead: boolean
  // 2025/12/01: IEntity 與 ICharacter 差異在於，未來可能有召喚物或低等生物等體系無法與角色共用的實體
}
