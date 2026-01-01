import { ItemRarity, ItemTemplate, ItemType } from '../../../../domain/item/Item'
import { ItemRollConfig } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { Result } from '../../../../shared/result/Result'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
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
  rollItem(source: string, modifiers: ItemRollModifier[]): Result<RollResult>
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
  rollItem(source: string, modifiers: ItemRollModifier[]): Result<RollResult> {
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
    const rarityMultipliers = this.aggregateModifiersByType(modifiers, 'RARITY')
    const adjustedWeights = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
      id: rarity as ItemRarity,
      weight: weight * (rarityMultipliers.get(rarity as ItemRarity) ?? 1),
    }))
    return WeightRoller.roll<ItemRarity>(seed, adjustedWeights)
  }
  /** 骰選物品樣板：根據修飾符調整樣板權重後骰選 */
  private rollTemplate(seed: number, templates: ItemTemplate[], modifiers: ItemRollModifier[]): Result<string> {
    // 聚合所有修飾符類型
    const modifierMap = this.aggregateTemplateModifiers(modifiers)
    // 根據修飾符調整樣板權重
    const weightList = templates.map((template) => ({
      id: template.id,
      weight: this.calculateTemplateWeight(template, modifierMap),
    }))
    return WeightRoller.roll<string>(seed, weightList)
  }
  /**
   * 聚合修飾符：按修飾符類型分組，相同目標的權重相乘
   * 支援類型：RARITY、TAG、ID
   * 返回：Map<修飾符鍵, 累積權重倍率>
   * 範例：
   *   - RARITY 修飾符：鍵為稀有度字符串（如 "EPIC"），值為權重倍率
   *   - TAG 修飾符：鍵為TAG字符串，值為權重倍率
   *   - ID 修飾符：鍵為樣板ID，值為權重倍率
   */
  private aggregateModifiersByType(modifiers: ItemRollModifier[], type: 'RARITY' | 'TAG' | 'ID'): Map<string, number> {
    const result = new Map<string, number>()
    const filtered = modifiers.filter((mod) => mod.type === type)
    for (const mod of filtered) {
      let key: string
      switch (type) {
        case 'RARITY':
          key = (mod as any).rarity
          break
        case 'TAG':
          key = (mod as any).tag
          break
        case 'ID':
          key = (mod as any).templateId
          break
      }
      const current = result.get(key) ?? 1
      result.set(key, current * mod.multiplier)
    }
    return result
  }
  /**
   * 聚合樣板修飾符：支援 RARITY、TAG、ID 三種類型
   * 返回聚合後的修飾符映射，便於計算樣板權重
   */
  private aggregateTemplateModifiers(modifiers: ItemRollModifier[]): {
    rarityMultipliers: Map<string, number>
    tagMultipliers: Map<string, number>
    idMultipliers: Map<string, number>
  } {
    return {
      rarityMultipliers: this.aggregateModifiersByType(modifiers, 'RARITY'),
      tagMultipliers: this.aggregateModifiersByType(modifiers, 'TAG'),
      idMultipliers: this.aggregateModifiersByType(modifiers, 'ID'),
    }
  }
  /**
   * 計算樣板的調整後權重
   * 邏輯：基礎權重乘以 ID 修飾符、TAG 修飾符、RARITY 修飾符的乘積
   * 注：RARITY 修飾符在骰選稀有度階段已應用，此處提供額外調整支援
   */
  private calculateTemplateWeight(
    template: ItemTemplate,
    modifierMap: {
      rarityMultipliers: Map<string, number>
      tagMultipliers: Map<string, number>
      idMultipliers: Map<string, number>
    }
  ): number {
    let weight = 1
    // 應用 ID 修飾符
    const idMod = modifierMap.idMultipliers.get(template.id)
    if (idMod !== undefined) {
      weight *= idMod
    }
    // 應用 TAG 修飾符：樣板擁有任何修飾符中的TAG時應用
    for (const [tag, multiplier] of modifierMap.tagMultipliers.entries()) {
      if (template.tags.includes(tag as any)) {
        weight *= multiplier
      }
    }
    return weight
  }
}
