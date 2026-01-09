import { ItemRollModifier } from '../../../../../domain/item/roll/ItemRollModifier'
import { CombatRewardType } from '../../../../../domain/post-combat/PostCombat'
import { ApplicationErrorCode } from '../../../../../shared/result/ErrorCodes'
import { Result } from '../../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
import { IItemRollModifierStrategy } from './strategy/IItemRollModifierStrategy'
import { ItemRollModifierStrategyFactory } from './strategy/ItemRollModifierStrategyFactory'

export interface IItemModifierAggregationService {
  aggregateShopModifiers(): Result<ItemRollModifier[], string>
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

    const strategyConfigs = itemConfig?.modifierStrategies ?? []

    const strategies = this.strategyFactory.createShopStrategies([...strategyConfigs])

    return mergeModifiers(strategies)
  }
  /**
   * Aggregate reward roll modifiers
   */
  aggregateRewardModifiers(rewardType: CombatRewardType): Result<ItemRollModifier[], string> {
    const strategies = this.strategyFactory.createRewardStrategies(rewardType)

    return mergeModifiers(strategies)
  }
}

function mergeModifiers(strategies: IItemRollModifierStrategy[]): Result<ItemRollModifier[], string> {
  const modifierMap = new Map<string, ItemRollModifier>()
  for (const strategy of strategies) {
    const modifiers = strategy.aggregateModifiers()
    for (const modifier of modifiers) {
      const keyResult = getModifierKey(modifier)
      if (keyResult.isFailure) return Result.fail(keyResult.error!)
      const key = keyResult.value!

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
function getModifierKey(modifier: ItemRollModifier): Result<string, string> {
  if (modifier.type === 'RARITY') {
    return Result.success(`RARITY:${modifier.rarity}`)
  }
  if (modifier.type === 'TAG') {
    return Result.success(`TAG:${modifier.tag}`)
  }
  if (modifier.type === 'ID') {
    return Result.success(`ID:${modifier.templateId}`)
  }
  return Result.fail(ApplicationErrorCode.物品_物品模板不存在)
}
