import { ItemRarity, ItemTemplate } from '../../domain/item/ItemTemplate'
import { ItemRollConfig, ItemRollSourceType, ItemRollType } from '../../domain/item/roll/ItemRollConfig'
import { ItemRollModifier } from '../../domain/item/roll/ItemRollModifier'
import { DifficultyHelper } from '../../shared/helpers/DifficultyHelper'
import { WeightRoller } from '../../shared/helpers/WeightRoller'
import { IAppContextService } from '../context/service/IAppContextService'
import { ItemInstantiator } from '../instantiator/ItemInstantiator'
import { TagCounter } from './TagCounter'

const generate = (service: IAppContextService, generationSource: ItemRollSourceType) => {
  const { runContext, itemStore } = service.getAppContext()
  // 取得靜態物品掉落限制表
  const staticRollConfig = itemStore.getItemRollConfig(generationSource)
  if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
  // 取得動態生成調節修飾符 同時幫忙清理掉已過期的修飾符
  const modifiers = getLatestItemRollModifiers(service)
  const itemType = rollItemType(runContext.seed, staticRollConfig)
  const itemRarity = rollItemRarity(runContext.seed, staticRollConfig, modifiers)
  const availableItemTemplates = fetchAvailableItemTemplates(service, itemType, itemRarity)
  const rolledItemTemplateId = rollItemTemplate(runContext.seed, availableItemTemplates)
  return createItemInstance(service, rolledItemTemplateId, itemType)
}

const getLatestItemRollModifiers = (service: IAppContextService): ItemRollModifier[] => {
  const runCtx1 = service.getAppContext().runContext
  const nextRollModifiers = [
    ...runCtx1.rollModifiers.filter((mod) => mod.durationStages !== 0),
    ...getHighFrequencyTagModifiers(service), // 當局有效不該存入 runContext
    ...getHighStackRelicModifiers(service), // 當局有效不該存入 runContext
  ]
  return nextRollModifiers
}

/** 取得已排除限制的物品樣板 */
const fetchAvailableItemTemplates = (service: IAppContextService, itemType: ItemRollType, itemRarity: ItemRarity) => {
  if (itemType === 'RELIC') {
    const items = service
      .getAppContext()
      .itemStore.getAllRelics()
      .filter((item) => item.rarity === itemRarity && IsItemGenerationAllowed(service, item))
    return items
  }
  return []
}
const IsItemGenerationAllowed = (service: IAppContextService, itemTemplate: ItemTemplate) => {
  const { characterContext, runContext, itemStore } = service.getAppContext()
  const constraint = itemStore.getItemRollConstraint(itemTemplate.id)
  if (!constraint) return true
  // 如果有篇章限制 且 不再當前篇章中 則排除
  if (constraint.chapters && !constraint.chapters.includes(runContext.currentChapter)) return false
  // 如果有職業限制 且 不符合角色職業 則排除
  if (constraint.professionIds && !constraint.professionIds.includes(characterContext.professionId)) return false
  // 如果是屬於敵人或事件掉落的物品 則排除
  if (
    (!!constraint.eventIds && constraint.eventIds.length > 0) ||
    (!!constraint.enemyIds && constraint.enemyIds?.length > 0)
  )
    return false
  return true
}

/** 找出已裝備高頻率標籤物品轉換成 tag 修飾符 */
const getHighFrequencyTagModifiers = (service: IAppContextService) => {
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
/** 找出高堆疊數物品轉換成 id 修飾符 */
const getHighStackRelicModifiers = (service: IAppContextService): ItemRollModifier[] => {
  const { characterContext, itemStore } = service.getAppContext()
  const relics = characterContext.relics
  const threshold = 5
  // Filter relics with high stacks (>=5) and not at max stack limit
  const highStackRelics = relics.filter((r) => {
    const isHighStack = r.currentStacks >= threshold
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

/** 骰物品類型 */
const rollItemType = (seed: number, rollConfig: ItemRollConfig) => {
  const itemTypeWeightList = Object.entries(rollConfig.itemTypeWeights).map(([itemType, weight]) => ({
    id: itemType as ItemRollType,
    weight: weight,
  }))
  return WeightRoller.roll<ItemRollType>(seed, itemTypeWeightList)
}

/** 骰稀有度 */
const rollItemRarity = (seed: number, rollConfig: ItemRollConfig, modifiers: ItemRollModifier[]) => {
  // 找出 rarity 相關的 mods
  const rarityModifiers = modifiers.filter((mod) => mod.type === 'RARITY')
  // 聚合同一 rarity 的 mod
  const aggregatedMods = new Map<ItemRarity, number>()
  for (const mod of rarityModifiers) {
    aggregatedMods.set(mod.rarity, (aggregatedMods.get(mod.rarity) ?? 1) + mod.multiplier)
  }
  const rarityWeightList = Object.entries(rollConfig.rarityWeights).map(([rarity, weight]) => ({
    id: rarity as ItemRarity,
    weight: weight * (aggregatedMods.get(rarity as ItemRarity) ?? 1),
  }))
  // 骰出 rarity
  return WeightRoller.roll<ItemRarity>(seed, rarityWeightList)
}

/** 骰物品樣板 */
const rollItemTemplate = (seed: number, templates: ItemTemplate[]) => {
  const templateWeightList = templates.map((template) => ({
    id: template.id,
    weight: 1, // TODO: 未來可能會有不同權重
  }))
  return WeightRoller.roll<string>(seed, templateWeightList)
}

const createItemInstance = (service: IAppContextService, templateId: string, itemType: ItemRollType) => {
  if (itemType !== 'RELIC') throw new Error('TODO: 拋領域錯誤,暫時沒有其他類型')
  const { characterContext, runContext, itemStore } = service.getAppContext()
  const { id: ownerId } = characterContext
  const { currentChapter, currentStage } = runContext
  const template = itemStore.getRelic(templateId)
  if (!template) throw new Error('TODO: 拋領域錯誤')
  const difficulty = DifficultyHelper.getDifficultyFactor(currentChapter, currentStage)
  const instance = ItemInstantiator.instantiateRelic(template, ownerId, difficulty, currentChapter, currentStage)
  return instance
}
