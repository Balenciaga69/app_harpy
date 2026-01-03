import { ItemRarity, ItemType } from '../Item'
import { CombatRewardType } from '../../post-combat/PostCombat'
/** 物品來源類型，區分物品的獲得途徑 */
export type ItemRollSourceType = 'POST_COMBAT_REWARD' | 'SHOP_REFRESH'
/** 物品生成修飾符策略類型 */
export type ItemRollModifierStrategyType = 'MOST_FREQUENT_TAG' | 'RARITY_PREFERENCE' | 'REVERSE_FREQUENT_TAG'
/** 物品生成修飾符策略定義：標識特定策略及其加成倍率 */
export interface ItemRollModifierStrategy {
  readonly strategyId: ItemRollModifierStrategyType
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
/** 獎勵 item 的配置 */
export interface RewardRollConfig extends ItemRollConfig {
  readonly rewardType: CombatRewardType
  /** RARITY_PREFERENCE 策略的稀有度倍率配置（可選） */
  readonly rarityMultipliers?: Record<ItemRarity, number>
}
