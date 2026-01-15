import { ItemRollModifierStrategyType } from '../../../../../../domain/item/roll/ItemRollConfig'
import { CombatRewardType } from '../../../../../../domain/post-combat/PostCombat'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './IItemRollModifierStrategy'
import { MostFrequentTagModifierStrategy } from './MostFrequentTagModifierStrategy'
import { MostFrequentTagRewardModifierStrategy } from './MostFrequentTagRewardModifierStrategy'
import { RarityRewardModifierStrategy } from './RarityRewardModifierStrategy'
import { ReverseFrequentTagRewardModifierStrategy } from './ReverseFrequentTagRewardModifierStrategy'
export class ItemRollModifierStrategyFactory {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  createShopStrategies(
    strategyConfigs: Array<{ strategyId: ItemRollModifierStrategyType; multiplier: number }>
  ): IItemRollModifierStrategy[] {
    const strategies: IItemRollModifierStrategy[] = []
    for (const config of strategyConfigs) {
      if (config.strategyId === 'MOST_FREQUENT_TAG') {
        const mostFrequentTagModifier = new MostFrequentTagModifierStrategy(
          this.configStoreAccessor,
          this.contextSnapshot,
          config.multiplier
        )
        strategies.push(mostFrequentTagModifier)
      }
    }
    return strategies
  }
  createRewardStrategies(rewardType: CombatRewardType): IItemRollModifierStrategy[] {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const rewardConfig = itemStore.getRewardRollConfig(rewardType)
    if (!rewardConfig) {
      return []
    }
    const strategies: IItemRollModifierStrategy[] = []
    for (const strategyConfig of rewardConfig.modifierStrategies) {
      switch (strategyConfig.strategyId) {
        case 'MOST_FREQUENT_TAG':
          strategies.push(
            new MostFrequentTagRewardModifierStrategy(
              this.configStoreAccessor,
              this.contextSnapshot,
              strategyConfig.multiplier
            )
          )
          break
        case 'RARITY_PREFERENCE':
          const rarityMultipliers = rewardConfig.rarityMultipliers || {
            COMMON: 1,
            RARE: 1,
            EPIC: 1,
            LEGENDARY: 1,
          }
          strategies.push(new RarityRewardModifierStrategy(rarityMultipliers))
          break
        case 'REVERSE_FREQUENT_TAG':
          strategies.push(new ReverseFrequentTagRewardModifierStrategy(this.configStoreAccessor, this.contextSnapshot))
          break
        default:
          break
      }
    }
    return strategies
  }
}
