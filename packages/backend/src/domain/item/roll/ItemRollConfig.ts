import { ItemRarity, ItemType } from '../Item'
/** 物品來源類型，區分物品的獲得途徑 */
export type ItemRollSourceType = 'POST_GAME_REWARD' | 'SHOP_REFRESH'
/** 物品生成配置，定義不同來源的物品類型與稀有度權重 */
export interface ItemRollConfig {
  readonly sourceType: ItemRollSourceType
  readonly itemTypeWeights: Record<ItemType, number>
  readonly rarityWeights: Record<ItemRarity, number>
}
