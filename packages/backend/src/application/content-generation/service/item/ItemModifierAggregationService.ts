import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { CombatRewardType } from '../../../../domain/post-combat/PostCombat'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './strategy/IItemRollModifierStrategy'
import { ItemRollModifierStrategyFactory } from './strategy/ItemRollModifierStrategyFactory'
/**
 * 物品修飾符聚合服務：根據來源與上下文選擇並聚合修飾符
 * 職責：根據生成來源（商店/獎勵）與獎勵類型選擇對應的策略集合，並合併修飾符
 * 依賴：IConfigStoreAccessor（讀物品配置）、IContextSnapshotAccessor（讀角色與運行狀態）、策略工廠
 * 邊界：純聚合邏輯，不修改任何狀態；多個修飾符權重採用相乘方式合併
 */
export interface IItemModifierAggregationService {
  /**
   * 聚合商店骰選修飾符
   * 根據配置的策略清單聚合所有適用修飾符
   */
  aggregateShopModifiers(): ItemRollModifier[]
  /**
   * 聚合獎勵骰選修飾符
   * 根據獎勵類型選擇對應的策略集合並聚合
   */
  aggregateRewardModifiers(rewardType: CombatRewardType): ItemRollModifier[]
}
export class ItemModifierAggregationService implements IItemModifierAggregationService {
  private strategyFactory: ItemRollModifierStrategyFactory
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    contextSnapshot: IContextSnapshotAccessor
  ) {
    this.strategyFactory = new ItemRollModifierStrategyFactory(configStoreAccessor, contextSnapshot)
  }
  /**
   * 聚合商店骰選修飾符
   * 流程：取得配置 → 建立策略 → 聚合修飾符
   */
  aggregateShopModifiers(): ItemRollModifier[] {
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const itemConfig = itemStore.getItemRollConfig('SHOP_REFRESH')
    // 取得配置中定義的修飾符策略
    const strategyConfigs = itemConfig?.modifierStrategies ?? []
    // 建立策略實例
    const strategies = this.strategyFactory.createShopStrategies([...strategyConfigs])
    // 聚合所有策略的修飾符
    return this.mergeModifiers(strategies)
  }
  /**
   * 聚合獎勵骰選修飾符
   * 流程：根據獎勵類型建立策略 → 聚合修飾符
   */
  aggregateRewardModifiers(rewardType: CombatRewardType): ItemRollModifier[] {
    // 建立對應獎勵類型的策略
    const strategies = this.strategyFactory.createRewardStrategies(rewardType)
    // 聚合所有策略的修飾符
    return this.mergeModifiers(strategies)
  }
  /**
   * 合併多個策略的修飾符
   * 邏輯：對相同的修飾符（相同type+identifier），權重採用相乘方式合併
   * 副作用：無
   */
  private mergeModifiers(strategies: IItemRollModifierStrategy[]): ItemRollModifier[] {
    const modifierMap = new Map<string, ItemRollModifier>()
    for (const strategy of strategies) {
      const modifiers = strategy.aggregateModifiers()
      for (const modifier of modifiers) {
        const key = this.getModifierKey(modifier)
        const existing = modifierMap.get(key)
        if (existing) {
          // 權重相乘
          existing.multiplier *= modifier.multiplier
        } else {
          // 首次出現，直接加入
          modifierMap.set(key, { ...modifier })
        }
      }
    }
    return Array.from(modifierMap.values())
  }
  /**
   * 計算修飾符的唯一鑰匙
   * 用於識別是否為同一個修飾符
   */
  private getModifierKey(modifier: ItemRollModifier): string {
    switch (modifier.type) {
      case 'RARITY':
        return `RARITY:${modifier.rarity}`
      case 'TAG':
        return `TAG:${modifier.tag}`
      case 'ID':
        return `ID:${modifier.templateId}`
      default:
        return ''
    }
  }
}
