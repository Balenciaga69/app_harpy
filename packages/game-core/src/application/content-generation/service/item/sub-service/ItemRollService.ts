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
export interface IItemRollService {
  rollItem(source: ItemRollConfigId, modifiers: ItemRollModifier[]): Result<RollResult>
}
export class ItemRollService implements IItemRollService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private constraintService: IItemConstraintService
  ) {}
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
