import { ItemRollModifier } from '../../../../../domain/item/roll/ItemRollModifier'
import { CombatRewardType } from '../../../../../domain/post-combat/PostCombat'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './strategy/ItemRollModifierStrategy'
import { ItemRollModifierStrategyFactory } from './strategy/ItemRollModifierStrategyFactory'
/**
 * Item Modifier Aggregation Service
 * Responsibility: Aggregate item roll modifiers from various strategies based on source type
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
   * Aggregate shop roll modifiers
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
   * Aggregate reward roll modifiers
   */
  aggregateRewardModifiers(rewardType: CombatRewardType): ItemRollModifier[] {
    // 建立對應獎勵類型的策略
    const strategies = this.strategyFactory.createRewardStrategies(rewardType)
    // 聚合所有策略的修飾符
    return this.mergeModifiers(strategies)
  }
  /**
   * Merge modifiers from multiple strategies
   */
  private mergeModifiers(strategies: IItemRollModifierStrategy[]): ItemRollModifier[] {
    const modifierMap = new Map<string, ItemRollModifier>()
    for (const strategy of strategies) {
      const modifiers = strategy.aggregateModifiers()
      for (const modifier of modifiers) {
        const key = this.getModifierKey(modifier)
        // 將所有同類型修飾符合併 例如: 稀有度:RARE, TAG: FIRE 會合併成一個修飾符
        const existing = modifierMap.get(key)
        if (existing) {
          existing.multiplier *= modifier.multiplier
        } else {
          modifierMap.set(key, { ...modifier })
        }
      }
    }
    return Array.from(modifierMap.values())
  }
  /**
   * 拿到修飾符的唯一鍵值，用於合併判斷
   */
  private getModifierKey(modifier: ItemRollModifier): string {
    if (modifier.type === 'RARITY') {
      return `RARITY:${modifier.rarity}`
    }
    if (modifier.type === 'TAG') {
      return `TAG:${modifier.tag}`
    }
    if (modifier.type === 'ID') {
      return `ID:${modifier.templateId}`
    }
    // 如果到這裡，說明有新的修飾符類型被新增但沒有處理
    throw new Error(`Unknown modifier type: ${(modifier as any).type}`)
  }
}
