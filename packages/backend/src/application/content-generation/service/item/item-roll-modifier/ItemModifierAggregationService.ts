import { ItemRollModifier } from '../../../../../domain/item/roll/ItemRollModifier'
import { CombatRewardType } from '../../../../../domain/post-combat/PostCombat'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
import { Result } from '../../../../../shared/result/Result'
import { ApplicationErrorCode } from '../../../../../shared/result/ErrorCodes'
import { IItemRollModifierStrategy } from './strategy/ItemRollModifierStrategy'
import { ItemRollModifierStrategyFactory } from './strategy/ItemRollModifierStrategyFactory'
/**
 * Item Modifier Aggregation Service
 * Responsibility: Aggregate item roll modifiers from various strategies based on source type
 */
export interface IItemModifierAggregationService {
  /**
   * 聚合商店骰選修飾符
   * 返回 Result 型別，包含修飾符陣列或錯誤訊息
   */
  aggregateShopModifiers(): Result<ItemRollModifier[], string>
  /**
   * 聚合獎勵骰選修飾符
   * 返回 Result 型別，包含修飾符陣列或錯誤訊息
   */
  aggregateRewardModifiers(rewardType: CombatRewardType): Result<ItemRollModifier[], string>
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
  aggregateShopModifiers(): Result<ItemRollModifier[], string> {
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
  aggregateRewardModifiers(rewardType: CombatRewardType): Result<ItemRollModifier[], string> {
    // 建立對應獎勵類型的策略
    const strategies = this.strategyFactory.createRewardStrategies(rewardType)
    // 聚合所有策略的修飾符
    return this.mergeModifiers(strategies)
  }
  /**
   * Merge modifiers from multiple strategies
   * 返回 Result 以确保边界安全
   */
  private mergeModifiers(strategies: IItemRollModifierStrategy[]): Result<ItemRollModifier[], string> {
    const modifierMap = new Map<string, ItemRollModifier>()
    for (const strategy of strategies) {
      const modifiers = strategy.aggregateModifiers()
      for (const modifier of modifiers) {
        const keyResult = this.getModifierKey(modifier)
        if (keyResult.isFailure) {
          return Result.fail(keyResult.error!)
        }
        const key = keyResult.value!
        // 將所有同類型修飾符合併 例如: 稀有度:RARE, TAG: FIRE 會合併成一個修飾符
        const existing = modifierMap.get(key)
        if (existing) {
          existing.multiplier *= modifier.multiplier
        } else {
          modifierMap.set(key, { ...modifier })
        }
      }
    }
    return Result.success(Array.from(modifierMap.values()))
  }
  /**
   * 拿到修飾符的唯一鍵值，用於合併判斷
   * 返回 Result 確保邊界安全，若修飾符型別未知則返回錯誤
   */
  private getModifierKey(modifier: ItemRollModifier): Result<string, string> {
    if (modifier.type === 'RARITY') {
      return Result.success(`RARITY:${modifier.rarity}`)
    }
    if (modifier.type === 'TAG') {
      return Result.success(`TAG:${modifier.tag}`)
    }
    if (modifier.type === 'ID') {
      return Result.success(`ID:${modifier.templateId}`)
    }
    // 如果到這裡，說明有新的修飾符類型被新增但沒有處理
    return Result.fail(ApplicationErrorCode.物品_物品模板不存在)
  }
}
