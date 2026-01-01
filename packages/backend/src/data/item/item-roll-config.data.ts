import { ItemRollConfig } from '../../domain/item/roll/ItemRollConfig'
/**
 * 商店刷新物品生成配置
 * 職責：定義商店骰選時的物品類型、稀有度與修飾符策略
 * 修飾符策略：最常出現TAG策略（親合度），鼓勵購買高親合度物品
 */
const ShopRefresh: ItemRollConfig = {
  sourceType: 'SHOP_REFRESH',
  itemTypeWeights: {
    RELIC: 1,
  },
  rarityWeights: {
    COMMON: 32,
    RARE: 16,
    EPIC: 8,
    LEGENDARY: 1,
  },
  modifierStrategies: [
    {
      strategyId: 'MOST_FREQUENT_TAG',
      multiplier: 1.5, // 親合度TAG增加1.5倍權重
    },
  ],
}
/**
 * 賽後獎勵物品生成配置（預設）
 * 職責：定義獎勵骰選時的物品類型與稀有度權重
 * 注：實際修飾符策略由獎勵類型（HIGH_RARITY_RELIC, HIGH_AFFINITY等）動態決定
 */
const PostCombatReward: ItemRollConfig = {
  sourceType: 'POST_COMBAT_REWARD',
  itemTypeWeights: {
    RELIC: 1,
  },
  rarityWeights: {
    COMMON: 0,
    RARE: 16,
    EPIC: 4,
    LEGENDARY: 1,
  },
  modifierStrategies: [], // 實際策略由獎勵類型決定，此處為空
}
export const ItemRollConfigList: ItemRollConfig[] = [ShopRefresh, PostCombatReward]
