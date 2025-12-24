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

export const ItemFactory = {
  createRelic, // 建立聖物實例
}
