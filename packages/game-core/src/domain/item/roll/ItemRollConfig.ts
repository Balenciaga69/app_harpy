import { CombatRewardType } from '../../post-combat/PostCombat'
import { ItemRarity, ItemType } from '../Item'

export type ItemRollSourceType = 'POST_COMBAT_REWARD' | 'SHOP_REFRESH'

export type ItemRollModifierStrategyType = 'MOST_FREQUENT_TAG' | 'RARITY_PREFERENCE' | 'REVERSE_FREQUENT_TAG'

export interface ItemRollModifierStrategy {
  readonly strategyId: ItemRollModifierStrategyType
  readonly multiplier: number
}

export interface ItemRollConfig {
  readonly sourceType: ItemRollSourceType
  readonly itemTypeWeights: Record<ItemType, number>
  readonly rarityWeights: Record<ItemRarity, number>

  readonly modifierStrategies: readonly ItemRollModifierStrategy[]
}

export interface RewardRollConfig extends ItemRollConfig {
  readonly rewardType: CombatRewardType

  readonly rarityMultipliers?: Record<ItemRarity, number>
}
