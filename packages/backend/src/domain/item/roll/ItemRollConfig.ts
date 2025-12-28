import { ItemRarity } from '../Item'
/** 物品生成類型，決定物品的基礎類別 */
export type ItemRollType = 'RELIC'
/** 物品來源類型，區分物品的獲得途徑 */
export type ItemRollSourceType = 'POST_GAME_REWARD' | 'SHOP_REFRESH'
/** 物品生成配置，定義不同來源的物品類型與稀有度權重 */
export interface ItemRollConfig {
  readonly sourceType: ItemRollSourceType
  readonly itemTypeWeights: Record<ItemRollType, number>
  readonly rarityWeights: Record<ItemRarity, number>
}
