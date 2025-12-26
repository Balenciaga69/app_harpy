import { nanoid } from 'nanoid'
import { ItemInstance, RelicInstance } from '../../../domain/item/itemInstance'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/ItemTemplate'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'
import { AffixFactory } from '../../content-generation/factory/AffixFactory'
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
/** 基於物品實例創建聖物實例，自動初始化堆疊計數為 1 */
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
/** 物品工廠：提供物品與聖物的批量實例化能力 */
export const ItemFactory = {
  createRelic, // 創建聖物實例，初始堆疊為 1
}
