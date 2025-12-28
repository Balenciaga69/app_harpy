import { ItemRarity, ItemTemplate } from '../../../../domain/item/Item'
import { ItemRollConfig, ItemRollType } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../../../shared/helpers/WeightRoller'
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
    if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
    const itemType = rollItemType(seed, staticRollConfig)
    const rarity = rollItemRarity(seed, staticRollConfig, modifiers)
    const availableTemplates = this.constraintService.getAvailableTemplates(itemType, rarity)
    const itemTemplateId = rollItemTemplate(seed, availableTemplates)
    return { itemTemplateId, itemType, rarity }
  }
}
//=== 骰選幫助類 ===
/** 根據配置權重骰選物品類型 */
const rollItemType = (seed: number, rollConfig: ItemRollConfig): ItemRollType => {
  const itemTypeWeightList = Object.entries(rollConfig.itemTypeWeights).map(([itemType, weight]) => ({
    id: itemType as ItemRollType,
    weight,
  }))
  return WeightRoller.roll<ItemRollType>(seed, itemTypeWeightList)
}
/** 根據修飾符調整權重後骰選稀有度，修飾符會乘算基礎權重 */
const rollItemRarity = (seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): ItemRarity => {
  const rarityModifiers = modifiers.filter((mod) => mod.type === 'RARITY')
  const aggregatedMods = new Map<ItemRarity, number>()
  for (const mod of rarityModifiers) {
    aggregatedMods.set(mod.rarity, (aggregatedMods.get(mod.rarity) ?? 1) + mod.multiplier)
  }
  const rarityWeightList = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
    id: rarity as ItemRarity,
    weight: weight * (aggregatedMods.get(rarity as ItemRarity) ?? 1),
  }))
  return WeightRoller.roll<ItemRarity>(seed, rarityWeightList)
}
/** 從可用樣板清單中骰選物品樣板，目前所有樣板權重均等 */
const rollItemTemplate = (seed: number, templates: ItemTemplate[]): string => {
  const templateWeightList = templates.map((template) => ({
    id: template.id,
    weight: 1, // TODO: 未來可能會有不同權重
  }))
  return WeightRoller.roll<string>(seed, templateWeightList)
}
