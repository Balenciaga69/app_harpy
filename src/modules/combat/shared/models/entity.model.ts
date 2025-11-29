export interface IEntity {
  id: string
  name: string
  team: 'player' | 'enemy'
  isDead: boolean
  // 這裡只定義最基礎的，屬性系統(Stats)之後再透過 Composition 組合進來
}
