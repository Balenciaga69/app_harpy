import { EquipmentSlot, ItemRarity } from '../../domain/item/ItemTemplate'
import { ItemRollConfig, ItemRollSourceType } from '../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../domain/item/roll/ItemRollModifier'
import { WeightRoller } from '../../shared/helpers/WeightRoller'
import { TagType } from '../../shared/models/TagType'
import { IAppContextService } from '../context/service/IAppContextService'
import { TagCounter } from './TagCounter'

const generate = (service: IAppContextService, generationSource: ItemRollSourceType) => {
  const { characterContext, runContext, stashContext, itemStore } = service.getAppContext()
  // 取得靜態物品掉落限制表
  const staticRollConfig = itemStore.getItemRollConfig(generationSource)
  if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
  // 取得動態生成調節修飾符 同時幫忙清理掉已過期的修飾符
  const modifiers = getLatestItemRollModifiers(service)
  const itemType = rollItemType(runContext.seed, staticRollConfig)
  const itemRarity = rollItemRarity(runContext.seed, staticRollConfig, modifiers)
  // const rolledItem = templateStore 骰物品
}

const getLatestItemRollModifiers = (service: IAppContextService): ItemRollModifier[] => {
  /**
   * 將根據玩家當前上下文（如已啟用的裝備、遺物、倉庫物品等）動態計算物品生成權重修飾符。
   * 具體包括：
   * - 根據特定屬性標籤（如毒、火等）在玩家所有持有物品中的分布情況，調整對應類型物品的生成概率。(O)
   * - 根據玩家持有某些特殊遺物的數量或狀態，動態提升該遺物相關物品的生成權重。(O)
   * - 根據物品的最大堆疊限制（MaxStack=1），若玩家已持有該物品，則在生成時移除該物品的生成概率。
   * - 需要對玩家倉庫及已裝備物品進行聚合查詢，以獲取完整的物品分布資訊。
   * - 最終返回根據上述規則動態計算後、且未過期（durationStages !== 0）的 ItemRollModifier 列表。
   */
  const runCtx1 = service.getAppContext().runContext
  const nextRollModifiers = [
    ...runCtx1.rollModifiers.filter((mod) => mod.durationStages !== 0),
    ...getHighFreqTagModifiers(service), // 當局有效不該存入 runContext
    ...highStackRelicModifiers(service), // 當局有效不該存入 runContext
  ]
  // service.setRunContext({ ...runCtx1, rollModifiers: nextRollModifiers })
  return nextRollModifiers
}

const getHighFreqTagModifiers = (service: IAppContextService) => {
  const threshold = 5
  const equippedTags = TagCounter.countEquippedTags(service.getAppContext()).toList()
  const highFreqTags = equippedTags.filter((t) => t.count >= threshold).map((t) => t.tag)
  const modifiers: ItemRollModifier[] = highFreqTags.map((tag) => ({
    id: `modifier-tag-${tag}`,
    type: 'TAG',
    tag: tag,
    multiplier: 0.5,
    durationStages: 0, // Only valid for current roll
  }))
  return modifiers
}

const highStackRelicModifiers = (service: IAppContextService): ItemRollModifier[] => {
  const { characterContext, itemStore } = service.getAppContext()
  const relics = characterContext.relics
  // Filter relics with high stacks (>=5) and not at max stack limit
  const highStackRelics = relics.filter((r) => {
    const isHighStack = r.currentStacks >= 5
    const relicTemplate = itemStore.getRelic(r.templateId)
    const notAtMax = relicTemplate ? r.currentStacks < relicTemplate.stackLimit : false
    return isHighStack && notAtMax
  })
  // Create modifiers for each high stack relic
  return highStackRelics.map((r) => ({
    id: `modifier-relic-${r.templateId}`,
    type: 'ID',
    templateId: r.templateId,
    multiplier: 0.2,
    durationStages: 0, // Only valid for current roll
  }))
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
