import { ItemRarity, ItemType } from '../Item'
/** 物品來源類型，區分物品的獲得途徑 */
export type ItemRollSourceType = 'POST_COMBAT_REWARD' | 'SHOP_REFRESH'
/** 物品生成修飾符策略定義：標識特定策略及其加成倍率 */
export interface ItemRollModifierStrategy {
  readonly strategyId: string
  readonly multiplier: number
}
/** 物品生成配置，定義不同來源的物品類型、稀有度權重及修飾符策略 */
export interface ItemRollConfig {
  readonly sourceType: ItemRollSourceType
  readonly itemTypeWeights: Record<ItemType, number>
  readonly rarityWeights: Record<ItemRarity, number>
  /** 此來源使用的修飾符策略清單，多個策略權重相乘 */
  readonly modifierStrategies: readonly ItemRollModifierStrategy[]
}
