import { CombatRewardType } from '../../../../../../domain/post-combat/PostCombat'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './ItemRollModifierStrategy'
import {
  MostFrequentTagModifierStrategy,
  RarityPreferenceRewardModifierStrategy,
  ReverseFrequentTagRewardModifierStrategy,
  MostFrequentTagRewardModifierStrategy,
} from './ItemRollModifierStrategy'
import { ItemRarity } from '../../../../../../domain/item/Item'
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
    strategyConfigs: Array<{ strategyId: string; multiplier: number }>
  ): IItemRollModifierStrategy[] {
    const strategies: IItemRollModifierStrategy[] = []
    for (const config of strategyConfigs) {
      switch (config.strategyId) {
        case 'MOST_FREQUENT_TAG':
          strategies.push(
            new MostFrequentTagModifierStrategy(this.configStoreAccessor, this.contextSnapshot, config.multiplier)
          )
          break
        case 'HIGH_STACK_RELIC':
          // 注：高堆疊策略需要額外的 templateId 與 stackThreshold，這裡需要從配置中取得
          // 為簡化起見，此處留待進一步擴展
          break
        default:
          // 未知策略，跳過
          break
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
          // 從配置中提取稀有度倍率，根據獎勵類型決定具體值
          const rarityMultipliers = this.extractRarityMultipliers(rewardType)
          strategies.push(new RarityPreferenceRewardModifierStrategy(rarityMultipliers))
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
  /**
   * 根據獎勵類型提取稀有度倍率
   * 私有方法：根據業務規則決定每個稀有度的加成倍率
   */
  private extractRarityMultipliers(rewardType: CombatRewardType): Record<ItemRarity, number> {
    // 根據奖励类型返回对应的稀有度倍率
    // 这些值来自原始代码中的硬编码，现在集中管理
    switch (rewardType) {
      case 'HIGH_RARITY_RELIC':
        return {
          COMMON: 0,
          RARE: 0.5,
          EPIC: 2,
          LEGENDARY: 3,
        }
      case 'BOSS_REWARD':
        return {
          COMMON: 0,
          RARE: 0.3,
          EPIC: 1.5,
          LEGENDARY: 4,
        }
      default:
        // 其他獎勵類型使用預設倍率（全 1）
        return {
          COMMON: 1,
          RARE: 1,
          EPIC: 1,
          LEGENDARY: 1,
        }
    }
  }
}
