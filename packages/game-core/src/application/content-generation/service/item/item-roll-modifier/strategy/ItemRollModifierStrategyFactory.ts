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
/**
 * 物品骰選修飾符策略工廠
 * 責任：根據來源（商店/獎勵）與配置，選擇並組裝相應的修飾符策略
 * 依賴：配置倉庫與上下文快照
 * 設計：從配置存儲讀取獎勵配置，而非硬編碼策略對應
 */
export class ItemRollModifierStrategyFactory {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor
  ) {}
  /**
   * 為商店骰選建立修飾符策略集合
   * 根據商店配置的策略清單來組裝具體的策略實現
   */
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
  /**
   * 為獎勵骰選建立修飾符策略集合
   * 根據獎勵類型從配置存儲讀取策略清單，並實例化對應策略
   */
  createRewardStrategies(rewardType: CombatRewardType): IItemRollModifierStrategy[] {
    // 從配置存儲讀取獎勵配置
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const rewardConfig = itemStore.getRewardRollConfig(rewardType)
    if (!rewardConfig) {
      return []
    }
    // 根據配置的策略清單實例化策略
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
          // 直接從配置中讀取稀有度倍率，無需額外計算或硬編碼
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
          // 未知策略，跳過
          break
      }
    }
    return strategies
  }
}
