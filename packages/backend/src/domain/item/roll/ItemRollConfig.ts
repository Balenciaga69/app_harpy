import { ItemRarity } from '../ItemTemplate'
export type ItemRollType = 'RELIC'
export type ItemRollSourceType = 'POST_GAME_REWARD' | 'SHOP_REFRESH'
export interface ItemRollConfig {
  readonly sourceType: ItemRollSourceType
  readonly itemTypeWeights: Record<ItemRollType, number>
  readonly rarityWeights: Record<ItemRarity, number>
}
