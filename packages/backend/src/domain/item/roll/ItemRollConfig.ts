import { ItemRarity } from '../ItemTemplate'

export type ItemRollType = 'EQUIPMENT' | 'RELIC' | 'SKILL_GEM'
export type ItemRollSourceType = 'POST_GAME_REWARD' | 'SHOP_REFRESH'

export interface ItemRollConfig {
  sourceType: ItemRollSourceType
  itemTypeWeights: Record<ItemRollType, number>
  rarityWeights: Record<ItemRarity, number>
}
