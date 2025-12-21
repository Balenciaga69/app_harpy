import { ItemRarity } from '../../domain/item/ItemTemplate'
import { ItemRollConfig, ItemRollSourceType } from '../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../domain/item/roll/ItemRollModifier'
import { IRunContext } from '../../domain/context/IRunContext'
import { WeightRoller } from '../../shared/helpers/WeightRoller'
import { TemplateStore } from '../store/TemplateStore'
import { ICharacterContext } from '../../domain/context/ICharacterContext'
import { IStashContext } from '../../domain/context/IStashContext'

const generate = (
  runCtx: IRunContext,
  charCtx: ICharacterContext,
  stashCtx: IStashContext,
  generationSource: ItemRollSourceType,
  templateStore: TemplateStore
) => {
  // 取得靜態物品掉落限制表
  const staticRollConfig = templateStore.getItemRollConfig(generationSource)
  if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
  // 取得動態生成調節修飾符 同時幫忙清理掉已過期的修飾符
  runCtx.rollModifiers = runCtx.rollModifiers.filter((mod) => mod.durationStages !== 0) // TODO:這是副作用 需要思考怎麼處理
  const modifiers = getLatestItemRollModifiers(runCtx, charCtx, stashCtx, templateStore)
  const itemType = rollItemType(runCtx.seed, staticRollConfig)
  const itemRarity = rollItemRarity(runCtx.seed, staticRollConfig, modifiers)
  // const rolledItem = templateStore 骰物品
}

const getLatestItemRollModifiers = (
  runCtx: IRunContext,
  charCtx: ICharacterContext,
  stashCtx: IStashContext,
  templateStore: TemplateStore
): ItemRollModifier[] => {
  /**
   * 將根據玩家當前上下文（如已啟用的裝備、遺物、倉庫物品等）動態計算物品生成權重修飾符。
   * 具體包括：
   * - 根據特定屬性標籤（如毒、火等）在玩家所有持有物品中的分布情況，調整對應類型物品的生成概率。
   * - 根據玩家持有某些特殊遺物的數量或狀態，動態提升該遺物相關物品的生成權重。
   * - 根據物品的最大堆疊限制（MaxStack=1），若玩家已持有該物品，則在生成時降低或移除該物品的生成概率。
   * - 需要對玩家倉庫及已裝備物品進行聚合查詢，以獲取完整的物品分布資訊。
   * - 最終返回根據上述規則動態計算後、且未過期（durationStages !== 0）的 ItemRollModifier 列表。
   */
  runCtx.rollModifiers = runCtx.rollModifiers.filter((mod) => mod.durationStages !== 0)
  return runCtx.rollModifiers
}

const rollItemType = (seed: number, rollConfig: ItemRollConfig) => {
  const itemTypeWeightList = Object.entries(rollConfig.itemTypeWeights).map(([itemType, weight]) => ({
    id: itemType,
    weight: weight,
  }))
  return WeightRoller.roll(seed, itemTypeWeightList)
}

const rollItemRarity = (seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]): string => {
  // Aggregate rarity modifiers
  const rarityModifiers = modifiers.filter((mod) => mod.type === 'RARITY')
  const aggregatedMods = new Map<ItemRarity, number>()
  for (const mod of rarityModifiers) {
    aggregatedMods.set(mod.rarity, (aggregatedMods.get(mod.rarity) ?? 1) + mod.multiplier)
  }
  // Build weighted rarity list
  const rarityWeightList = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
    id: rarity,
    weight: weight * (aggregatedMods.get(rarity as ItemRarity) ?? 1),
  }))

  // Roll for rarity
  return WeightRoller.roll(seed, rarityWeightList)
}
