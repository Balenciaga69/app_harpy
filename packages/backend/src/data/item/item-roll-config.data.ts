import { ItemRollConfig, RewardRollConfig } from '../../domain/item/roll/ItemRollConfig'
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
 * 賽後獎勵物品生成配置集合
 * 職責：定義各獎勵類型的物品生成配置，包含稀有度權重與修飾符策略
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
  },
}
export const ItemRollConfigList: ItemRollConfig[] = [ShopRefresh, ...Object.values(RewardRollConfigs)]
/** 獲取所有獎勵配置列表 */
export const RewardRollConfigList: RewardRollConfig[] = Object.values(RewardRollConfigs)
/** 根據獎勵類型取得對應的骰選配置 */
export function getRewardRollConfig(rewardType: string): RewardRollConfig | undefined {
  return RewardRollConfigs[rewardType]
}
