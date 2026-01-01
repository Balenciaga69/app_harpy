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
/**
 * 物品骰選修飾符策略工廠
 * 責任：根據來源（商店/獎勵）與配置，選擇並組裝相應的修飾符策略
 * 依賴：配置倉庫與上下文快照
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
   * 根據獎勵類型選擇適當的策略
   */
  createRewardStrategies(rewardType: CombatRewardType): IItemRollModifierStrategy[] {
    switch (rewardType) {
      case 'HIGH_RARITY_RELIC':
        return [
          new RarityPreferenceRewardModifierStrategy({
            COMMON: 0,
            RARE: 0.5,
            EPIC: 2,
            LEGENDARY: 3,
          }),
          new MostFrequentTagRewardModifierStrategy(
            this.configStoreAccessor,
            this.contextSnapshot,
            1 // 基礎倍率
          ),
        ]
      case 'HIGH_AFFINITY':
        return [new MostFrequentTagRewardModifierStrategy(this.configStoreAccessor, this.contextSnapshot, 1.5)]
      case 'LOW_AFFINITY':
        return [new ReverseFrequentTagRewardModifierStrategy(this.configStoreAccessor, this.contextSnapshot)]
      case 'GOLD':
        // 金幣獎勵也使用最常出現TAG策略來決定物品估價
        return [new MostFrequentTagRewardModifierStrategy(this.configStoreAccessor, this.contextSnapshot, 1)]
      case 'BOSS_REWARD':
        // BOSS獎勵可以擁有更高稀有度偏好
        return [
          new RarityPreferenceRewardModifierStrategy({
            COMMON: 0,
            RARE: 0.3,
            EPIC: 1.5,
            LEGENDARY: 4,
          }),
        ]
      default:
        return []
    }
  }
}
