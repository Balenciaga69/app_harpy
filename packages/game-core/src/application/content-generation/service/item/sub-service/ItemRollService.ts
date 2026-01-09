import { ItemRarity, ItemTemplate, ItemType } from '../../../../../domain/item/Item'
import { ItemRollConfig } from '../../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../../shared/helpers/WeightRoller'
import { Result } from '../../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../../core-infrastructure/context/service/AppContextService'
import { ItemRollConfigId } from '../../../../core-infrastructure/static-config/IConfigStores'
import {
  aggregateModifiersByType,
  aggregateTemplateModifiers,
  calculateTemplateWeight,
} from '../item-roll-modifier/ModifierAggregationHelper'
import { IItemConstraintService } from './ItemConstraintService'

type RollResult = {
  itemTemplateId: string
  itemType: ItemType
  rarity: ItemRarity
}

type ItemTypeAndRarityResult = { itemType: ItemType; rarity: ItemRarity }
/**
 * 物品骰選服務：執行物品骰選流程
 * 職責：協調物品類型、稀有度、樣板的骰選，應用修飾符並選出最終物品
 * 設計：純骰選流程，修飾符聚合邏輯從 ItemModifierAggregationService 分離
 */
export interface IItemRollService {
  rollItem(source: ItemRollConfigId, modifiers: ItemRollModifier[]): Result<RollResult>
}
export class ItemRollService implements IItemRollService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private constraintService: IItemConstraintService
  ) {}
  /**
   * 按順序骰選物品類型、稀有度，最後從符合限制的樣板中骰選
   */
  rollItem(source: ItemRollConfigId, modifiers: ItemRollModifier[]): Result<RollResult> {
    const { seed } = this.contextSnapshot.getRunContext()
    const { itemStore } = this.configStoreAccessor.getConfigStore()

    const typeAndRarityResult = this.rollItemTypeAndRarity(seed, itemStore.getItemRollConfig(source), modifiers)
    if (typeAndRarityResult.isFailure) {
      return Result.fail(typeAndRarityResult.error!)
    }
    const { itemType, rarity } = typeAndRarityResult.value!

    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)

    const templateIdResult = this.rollTemplate(seed, availableTemplates, modifiers)
    if (templateIdResult.isFailure) {
      return Result.fail(templateIdResult.error!)
    }

    return Result.success({
      itemTemplateId: templateIdResult.value!,
      itemType,
      rarity,
    })
  }
  /**
   * 骰選物品類型與稀有度
   */
  private rollItemTypeAndRarity(
    seed: number,
    rollConfig: ItemRollConfig,
    modifiers: ItemRollModifier[]
  ): Result<ItemTypeAndRarityResult> {
    const itemTypeResult = this.rollFromWeights(seed, rollConfig.itemTypeWeights)
    if (itemTypeResult.isFailure) {
      return Result.fail(itemTypeResult.error!)
    }
    const rarityResult = this.rollRarity(seed, rollConfig, modifiers)
    if (rarityResult.isFailure) {
      return Result.fail(rarityResult.error!)
    }
    return Result.success({
      itemType: itemTypeResult.value!,
      rarity: rarityResult.value!,
    })
  }

  private rollFromWeights<T extends string>(seed: number, weights: Record<T, number>): Result<T> {
    const weightList = Object.entries(weights).map(([key, weight]) => ({
      id: key as T,
      weight: weight as number,
    }))
    return WeightRoller.roll<T>(seed, weightList)
  }

  private rollRarity(seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): Result<ItemRarity> {
    const rarityMultipliers = aggregateModifiersByType(modifiers, 'RARITY')

    const adjustedWeights = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
      id: rarity as ItemRarity,
      weight: weight * (rarityMultipliers.get(rarity as ItemRarity) ?? 1),
    }))
    return WeightRoller.roll<ItemRarity>(seed, adjustedWeights)
  }

  private rollTemplate(seed: number, templates: ItemTemplate[], modifiers: ItemRollModifier[]): Result<string> {
    const modifierMap = aggregateTemplateModifiers(modifiers)

    const weightList = templates.map((template) => ({
      id: template.id,
      weight: calculateTemplateWeight(template, modifierMap),
    }))
    return WeightRoller.roll<string>(seed, weightList)
  }
}
