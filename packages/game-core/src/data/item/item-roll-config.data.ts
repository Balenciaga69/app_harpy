import { ItemRarity } from '../../domain/item/Item'
import { ItemRollConfig, RewardRollConfig } from '../../domain/item/roll/ItemRollConfig'
const ShopRefresh: ItemRollConfig = {
  sourceType: 'SHOP_REFRESH',
  itemTypeWeights: { RELIC: 1 },
  rarityWeights: { COMMON: 32, RARE: 16, EPIC: 8, LEGENDARY: 1 },
  modifierStrategies: [{ strategyId: 'MOST_FREQUENT_TAG', multiplier: 1.5 }],
}
const RarityMultipliers: Record<string, Record<ItemRarity, number>> = {
  HIGH_RARITY_RELIC: { COMMON: 0, RARE: 0.5, EPIC: 2, LEGENDARY: 3 },
  ELITE_REWARD: { COMMON: 0, RARE: 0.3, EPIC: 1.2, LEGENDARY: 2.5 },
  BOSS_REWARD: { COMMON: 0, RARE: 0, EPIC: 1.5, LEGENDARY: 4 },
}
const baseRewardConfig = {
  sourceType: 'POST_COMBAT_REWARD' as const,
  itemTypeWeights: { RELIC: 1 },
  rarityWeights: { COMMON: 0, RARE: 16, EPIC: 4, LEGENDARY: 1 },
}
const RewardRollConfigs: Record<string, RewardRollConfig> = {
  HIGH_RARITY_RELIC: {
    ...baseRewardConfig,
    rewardType: 'HIGH_RARITY_RELIC',
    modifierStrategies: [
      { strategyId: 'RARITY_PREFERENCE', multiplier: 1 },
      { strategyId: 'MOST_FREQUENT_TAG', multiplier: 1 },
    ],

    rarityMultipliers: RarityMultipliers.HIGH_RARITY_RELIC,
  },
  HIGH_AFFINITY: {
    ...baseRewardConfig,
    rewardType: 'HIGH_AFFINITY',
    modifierStrategies: [{ strategyId: 'MOST_FREQUENT_TAG', multiplier: 1.5 }],
  },
  LOW_AFFINITY: {
    ...baseRewardConfig,
    rewardType: 'LOW_AFFINITY',
    modifierStrategies: [{ strategyId: 'REVERSE_FREQUENT_TAG', multiplier: 1 }],
  },
  GOLD: {
    ...baseRewardConfig,
    rewardType: 'GOLD',
    modifierStrategies: [{ strategyId: 'MOST_FREQUENT_TAG', multiplier: 1 }],
  },
  ELITE_REWARD: {
    ...baseRewardConfig,
    rewardType: 'ELITE_REWARD',
    modifierStrategies: [{ strategyId: 'RARITY_PREFERENCE', multiplier: 1 }],
    rarityMultipliers: RarityMultipliers.ELITE_REWARD,
  },
  BOSS_REWARD: {
    ...baseRewardConfig,
    rewardType: 'BOSS_REWARD',
    modifierStrategies: [{ strategyId: 'RARITY_PREFERENCE', multiplier: 1 }],
    rarityMultipliers: RarityMultipliers.BOSS_REWARD,
  },
}
export const ItemRollConfigList: ItemRollConfig[] = [ShopRefresh, ...Object.values(RewardRollConfigs)]

export const RewardRollConfigList: RewardRollConfig[] = Object.values(RewardRollConfigs)

export function getRewardRollConfig(rewardType: string): RewardRollConfig | undefined {
  return RewardRollConfigs[rewardType]
}
