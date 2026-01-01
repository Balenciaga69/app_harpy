import { ItemRollConfig, RewardRollConfig } from '../../domain/item/roll/ItemRollConfig'
import { ItemRarity } from '../../domain/item/Item'
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
 * 稀有度偏好修飾符策略的倍率配置
 * 用於 RARITY_PREFERENCE 策略，定義不同獎勵類型對各稀有度的加成倍數
 * 設計：集中管理所有稀有度倍率，便於調整業務規則
 */
const RarityPreferenceMultipliers: Record<string, Record<ItemRarity, number>> = {
  /** 高稀有度聖物：平衡稀有品與史詩品 */
  HIGH_RARITY_RELIC: {
    COMMON: 0,
    RARE: 0.5,
    EPIC: 2,
    LEGENDARY: 3,
  },
  /** 精英獎勵：適度增加稀有度，比BOSS獎勵溫和 */
  ELITE_REWARD: {
    COMMON: 0,
    RARE: 0.3, // 稍微增加稀有品
    EPIC: 1.2, // 適度增加史詩品
    LEGENDARY: 2.5, // 中等概率的傳奇
  },
  /** BOSS獎勵：大幅偏好高稀有度 */
  BOSS_REWARD: {
    COMMON: 0,
    RARE: 0, // 完全不選稀有品
    EPIC: 1.5,
    LEGENDARY: 4, // 大幅增加傳奇概率
  },
}
/**
 * 賽後獎勵物品生成配置集合
 * 職責：定義各獎勵類型的物品生成配置，包含稀有度權重、修飾符策略與稀有度倍率
 * 設計：每個獎勵類型獨立配置，易於調整業務規則
 */
const RewardRollConfigs: Record<string, RewardRollConfig> = {
  /** 高稀有度聖物：偏好稀有度+最常TAG親合度 */
  HIGH_RARITY_RELIC: {
    rewardType: 'HIGH_RARITY_RELIC',
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
    modifierStrategies: [
      {
        strategyId: 'RARITY_PREFERENCE',
        multiplier: 1,
      },
      {
        strategyId: 'MOST_FREQUENT_TAG',
        multiplier: 1,
      },
    ],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.HIGH_RARITY_RELIC,
  },
  /** 高親合度聖物：優先選擇玩家已有TAG的物品 */
  HIGH_AFFINITY: {
    rewardType: 'HIGH_AFFINITY',
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
    modifierStrategies: [
      {
        strategyId: 'MOST_FREQUENT_TAG',
        multiplier: 1.5,
      },
    ],
  },
  /** 低親合度聖物：避開玩家已有的TAG，提供多樣化選擇 */
  LOW_AFFINITY: {
    rewardType: 'LOW_AFFINITY',
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
    modifierStrategies: [
      {
        strategyId: 'REVERSE_FREQUENT_TAG',
        multiplier: 1,
      },
    ],
  },
  /** 金幣獎勵：使用最常TAG策略來決定物品估價 */
  GOLD: {
    rewardType: 'GOLD',
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
    modifierStrategies: [
      {
        strategyId: 'MOST_FREQUENT_TAG',
        multiplier: 1,
      },
    ],
  },
  /** 精英獎勵：適度增加稀有度，為一般與BOSS獎勵間的中間選項 */
  ELITE_REWARD: {
    rewardType: 'ELITE_REWARD',
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
    modifierStrategies: [
      {
        strategyId: 'RARITY_PREFERENCE',
        multiplier: 1,
      },
    ],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.ELITE_REWARD,
  },
  /** BOSS獎勵：提供更高稀有度的物品 */
  BOSS_REWARD: {
    rewardType: 'BOSS_REWARD',
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
    modifierStrategies: [
      {
        strategyId: 'RARITY_PREFERENCE',
        multiplier: 1,
      },
    ],
    rarityPreferenceMultipliers: RarityPreferenceMultipliers.BOSS_REWARD,
  },
}
export const ItemRollConfigList: ItemRollConfig[] = [ShopRefresh, ...Object.values(RewardRollConfigs)]
/** 獲取所有獎勵配置列表 */
export const RewardRollConfigList: RewardRollConfig[] = Object.values(RewardRollConfigs)
/** 根據獎勵類型取得對應的骰選配置 */
export function getRewardRollConfig(rewardType: string): RewardRollConfig | undefined {
  return RewardRollConfigs[rewardType]
}
