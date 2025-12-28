import { ItemRarity, ItemTemplate } from '../../../../domain/item/Item'
import { ItemRollConfig, ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
import { ConfigNotFoundError } from '../../../../shared/errors/GameErrors'
import {
  IConfigStoreAccessor,
  IContextSnapshotAccessor,
} from '../../../core-infrastructure/context/service/AppContextService'
import { IItemConstraintService } from './ItemConstraintService'

/**
 * 物品骰選服務：執行物品骰選流程
 * 職責：根據來源、修飾符、限制條件骰選物品
 * 依賴：IConfigStoreAccessor（讀骰選配置）、IContextSnapshotAccessor（讀種子）、IItemConstraintService（檢查生成限制）
 * 流程：骰選類型 → 骰選稀有度 → 篩選符合條件的樣板 → 骰選樣板
 */
export interface IItemRollService {
  /** 根據來源與修飾符骰選物品，返回樣板ID、類型、稀有度 */
  rollItem(
    source: string,
    modifiers: ItemRollModifier[]
  ): {
    itemTemplateId: string
    itemType: ItemRollType
    rarity: ItemRarity
  }
}
export class ItemRollService implements IItemRollService {
  constructor(
    private configStoreAccessor: IConfigStoreAccessor,
    private contextSnapshot: IContextSnapshotAccessor,
    private constraintService: IItemConstraintService
  ) {}
  /**
   * 按順序骰選物品類型、稀有度，最後從符合限制的樣板中骰選
   * 邊界：來源配置必須存在，否則拋錯
   * 副作用：無（純骰選邏輯）
   */
  rollItem(
    source: string,
    modifiers: ItemRollModifier[]
  ): { itemTemplateId: string; itemType: ItemRollType; rarity: ItemRarity } {
    const { seed } = this.contextSnapshot.getRunContext()
    const { itemStore } = this.configStoreAccessor.getConfigStore()
    const staticRollConfig = itemStore.getItemRollConfig(source)
    if (!staticRollConfig) {
      throw new ConfigNotFoundError('ItemRollConfig', source)
    }
    const itemType = this.rollFromWeights(seed, staticRollConfig.itemTypeWeights)
    const rarity = this.rollRarity(seed, staticRollConfig, modifiers)
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const itemTemplateId = this.rollTemplate(seed, availableTemplates)
    return { itemTemplateId, itemType, rarity }
  }

  /** 通用權重骰選：從權重映射中骰選結果 */
  private rollFromWeights<T extends string>(seed: number, weights: Record<T, number>): T {
    const weightList = Object.entries(weights).map(([key, weight]) => ({
      id: key as T,
      weight: weight as number,
    }))
    return WeightRoller.roll<T>(seed, weightList)
  }

  /** 骰選稀有度：根據修飾符調整權重後骰選 */
  private rollRarity(seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): ItemRarity {
    const rarityMods = this.aggregateRarityModifiers(modifiers)
    const adjustedWeights = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
      id: rarity as ItemRarity,
      weight: weight * (rarityMods.get(rarity as ItemRarity) ?? 1),
    }))
    return WeightRoller.roll<ItemRarity>(seed, adjustedWeights)
  }

  /** 聚合稀有度修飾符：將多個修飾符合併為單一權重映射 */
  private aggregateRarityModifiers(modifiers: ItemRollModifier[]): Map<ItemRarity, number> {
    const rarityMods = modifiers.filter((mod) => mod.type === 'RARITY')
    const result = new Map<ItemRarity, number>()
    for (const mod of rarityMods) {
      const current = result.get(mod.rarity) ?? 1
      result.set(mod.rarity, current + mod.multiplier)
    }
    return result
  }

  /** 骰選物品樣板：從可用樣板清單中均等骰選 */
  private rollTemplate(seed: number, templates: ItemTemplate[]): string {
    const weightList = templates.map((template) => ({ id: template.id, weight: 1 }))
    return WeightRoller.roll<string>(seed, weightList)
  }
}
