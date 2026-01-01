import { ItemRarity, ItemTemplate, ItemType } from '../../../../domain/item/Item'
import { ItemRollConfig } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { Result } from '../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { ItemRollConfigId } from '../../../core-infrastructure/static-config/IConfigStores'
import { IItemConstraintService } from './ItemConstraintService'
import {
  aggregateTemplateModifiers,
  calculateTemplateWeight,
  aggregateModifiersByType,
} from './item-roll-modifier/ModifierAggregationHelper'
/** 骰選結果類型 */
type RollResult = {
  itemTemplateId: string
  itemType: ItemType
  rarity: ItemRarity
}
/**
 * 物品骰選服務：執行物品骰選流程
 * 職責：協調物品類型、稀有度、樣板的骰選，應用修飾符並選出最終物品
 * 設計：純骰選流程，修飾符聚合邏輯從 ItemModifierAggregationService 分離
 */
export interface IItemRollService {
  /** 根據來源與修飾符骰選物品，返回樣板ID、類型、稀有度 */
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
    // 取得骰選配置
    const staticRollConfig = itemStore.getItemRollConfig(source)
    // 骰選物品類型與稀有度
    const itemTypeResult = this.rollFromWeights(seed, staticRollConfig.itemTypeWeights)
    const rarityResult = this.rollRarity(seed, staticRollConfig, modifiers)
    const combinedResult = Result.combine([itemTypeResult, rarityResult])
    if (combinedResult.isFailure) return Result.fail(combinedResult.error!)
    const itemType = itemTypeResult.value!
    const rarity = rarityResult.value!
    // 根據類型與稀有度篩選樣板，並骰選最終樣板
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const itemTemplateIdResult = this.rollTemplate(seed, availableTemplates, modifiers)
    if (itemTemplateIdResult.isFailure) return Result.fail(itemTemplateIdResult.error!)
    // 返回結果
    const itemTemplateId = itemTemplateIdResult.value!
    return Result.success({ itemTemplateId, itemType, rarity })
  }
  /** 通用權重骰選：從權重映射中骰選結果 */
  private rollFromWeights<T extends string>(seed: number, weights: Record<T, number>): Result<T> {
    const weightList = Object.entries(weights).map(([key, weight]) => ({
      id: key as T,
      weight: weight as number,
    }))
    return WeightRoller.roll<T>(seed, weightList)
  }
  /** 骰選稀有度：根據修飾符調整權重後骰選 */
  private rollRarity(seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): Result<ItemRarity> {
    // 取得 聚合後的 rarity 修飾符
    const rarityMultipliers = aggregateModifiersByType(modifiers, 'RARITY')
    // 根據修飾符調整稀有度權重
    const adjustedWeights = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
      id: rarity as ItemRarity,
      weight: weight * (rarityMultipliers.get(rarity as ItemRarity) ?? 1),
    }))
    return WeightRoller.roll<ItemRarity>(seed, adjustedWeights)
  }
  /** 骰選物品樣板：根據修飾符調整樣板權重後骰選 */
  private rollTemplate(seed: number, templates: ItemTemplate[], modifiers: ItemRollModifier[]): Result<string> {
    // 聚合所有修飾符類型
    const modifierMap = aggregateTemplateModifiers(modifiers)
    // 根據修飾符調整樣板權重
    const weightList = templates.map((template) => ({
      id: template.id,
      weight: calculateTemplateWeight(template, modifierMap),
    }))
    return WeightRoller.roll<string>(seed, weightList)
  }
}
