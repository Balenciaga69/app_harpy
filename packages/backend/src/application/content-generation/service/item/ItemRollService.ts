import { ItemRarity, ItemTemplate, ItemType } from '../../../../domain/item/Item'
import { ItemRollConfig } from '../../../../domain/item/roll/ItemRollConfig'
import {
  ItemRollIdModifier,
  ItemRollModifier,
  ItemRollModifierType,
  ItemRollRarityModifier,
  ItemRollTagModifier,
} from '../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { TagType } from '../../../../shared/models/TagType'
import { Result } from '../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { ItemRollConfigId } from '../../../core-infrastructure/static-config/IConfigStores'
import { IItemConstraintService } from './ItemConstraintService'
/** 骰選結果類型 */
type RollResult = {
  itemTemplateId: string
  itemType: ItemType
  rarity: ItemRarity
}
/**
 * 物品骰選服務：執行物品骰選流程
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
/** 聚合不同類型的修飾符並以乘法合併相同鍵位的倍率 */
export const aggregateModifiersByType = (
  modifiers: ItemRollModifier[],
  type: ItemRollModifierType
): Map<string, number> => {
  const result = new Map<string, number>()
  for (const mod of modifiers) {
    if (mod.type !== type) continue
    let key: string
    if (type === 'RARITY') {
      key = (mod as ItemRollRarityModifier).rarity
    } else if (type === 'TAG') {
      key = (mod as ItemRollTagModifier).tag
    } else {
      key = (mod as ItemRollIdModifier).templateId
    }
    const current = result.get(key) ?? 1
    result.set(key, current * mod.multiplier)
  }
  return result
}
/** 批量聚合 Rarity, Tag, 和 ID 類型的修飾符 */
export const aggregateTemplateModifiers = (modifiers: ItemRollModifier[]) => {
  const rarityMap = aggregateModifiersByType(modifiers, 'RARITY')
  const tagMap = aggregateModifiersByType(modifiers, 'TAG')
  const idMap = aggregateModifiersByType(modifiers, 'ID')
  return {
    rarityMultipliers: rarityMap as Map<ItemRarity, number>,
    tagMultipliers: tagMap as Map<TagType, number>,
    idMultipliers: idMap,
  }
}
/** 計算 Template 最終分配到的權重 */
export const calculateTemplateWeight = (
  template: ItemTemplate,
  modifiers: {
    rarityMultipliers: Map<ItemRarity, number>
    tagMultipliers: Map<TagType, number>
    idMultipliers: Map<string, number>
  },
  baseWeight = 1
): number => {
  let weight = baseWeight
  // 處理 id 修飾符
  const idMod = modifiers.idMultipliers.get(template.id)
  if (idMod !== undefined) weight *= idMod
  // 處理 tag 修飾符
  for (const [tag, multiplier] of modifiers.tagMultipliers.entries()) {
    if (template.tags.includes(tag)) {
      weight *= multiplier
    }
  }
  // 處理 rarity 修飾符
  const rarityMod = modifiers.rarityMultipliers.get(template.rarity)
  if (rarityMod !== undefined) weight *= rarityMod
  return weight
}
