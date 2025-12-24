import { nanoid } from 'nanoid'
import { ItemInstance, RelicInstance } from '../../../domain/item/itemInstance'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/ItemTemplate'
import { ItemRollSourceType } from '../../../domain/item/roll/ItemRollConfig'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { IAppContextService } from '../../core-infrastructure/context/service/AppContextService'
import { AffixFactory } from '../../enemy-encounter/factory/AffixFactory'
import { fetchAvailableItemTemplates } from '../helper/itemConstraintHelpers'
import { createItemInstance } from '../helper/itemCreationHelpers'
import { getLatestItemRollModifiers } from '../helper/itemModifierHelpers'
import { rollItemRarity, rollItemTemplate, rollItemType } from '../helper/itemRollHelpers'

const createItem = (params: {
  template: ItemTemplate
  ownerUnitId: string
  difficulty: number
  chapter: ChapterLevel
  stage: number
}): ItemInstance => {
  const { template, ownerUnitId, difficulty, chapter, stage } = params
  const affixInstances = AffixFactory.createMany({
    templateIds: template.affixIds,
    difficulty,
    chapter,
    stage,
    sourceUnitId: ownerUnitId,
  })
  return {
    id: `item-${nanoid()}`,
    templateId: template.id,
    affixInstances: affixInstances,
    atCreated: {
      chapter,
      stage,
      difficulty,
    },
  }
}

const createRelic = (
  template: RelicTemplate,
  ownerUnitId: string,
  difficulty: number,
  chapter: ChapterLevel,
  stage: number
): RelicInstance => {
  const item = createItem({ template, ownerUnitId, difficulty, chapter, stage })
  return { ...item, currentStacks: 1 } as RelicInstance
}

const createRandomOne = (service: IAppContextService, generationSource: ItemRollSourceType) => {
  const contexts = service.GetContexts()
  const config = service.GetConfig()
  const runContext = contexts.runContext
  const itemStore = config.itemStore
  // 取得靜態物品掉落限制表
  const staticRollConfig = itemStore.getItemRollConfig(generationSource)
  if (!staticRollConfig) throw new Error('TODO: 拋領域錯誤')
  // 取得動態生成調節修飾符 同時幫忙清理掉已過期的修飾符
  const modifiers = getLatestItemRollModifiers(service)
  const itemType = rollItemType(runContext.seed, staticRollConfig)
  const itemRarity = rollItemRarity(runContext.seed, staticRollConfig, modifiers)
  // 取得可用物品樣板並骰出一個
  const availableItemTemplates = fetchAvailableItemTemplates(service, itemType, itemRarity)
  const rolledItemTemplateId = rollItemTemplate(runContext.seed, availableItemTemplates)
  return createItemInstance(service, rolledItemTemplateId, itemType)
}

export const ItemFactory = {
  createRelic, // 建立聖物實例
  createRandomOne, // 建立隨機物品實例
}
