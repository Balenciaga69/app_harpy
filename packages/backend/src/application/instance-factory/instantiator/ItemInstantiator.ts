import { nanoid } from 'nanoid'
import { ItemInstance, RelicInstance } from '../../../domain/item/itemInstance'
import { ItemTemplate, RelicTemplate } from '../../../domain/item/ItemTemplate'
import { AffixInstantiator } from './AffixInstantiator'
import { ChapterLevel } from '../../../shared/models/TemplateWeightInfo'

const instantiateItem = (params: {
  template: ItemTemplate
  ownerUnitId: string
  difficulty: number
  chapter: ChapterLevel
  stage: number
}): ItemInstance => {
  const { template, ownerUnitId, difficulty, chapter, stage } = params
  const affixInstances = AffixInstantiator.instantiateMany({
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

const instantiateRelic = (
  template: RelicTemplate,
  ownerUnitId: string,
  difficulty: number,
  chapter: ChapterLevel,
  stage: number
): RelicInstance => {
  const item = instantiateItem({ template, ownerUnitId, difficulty, chapter, stage })
  return { ...item, currentStacks: 1 } as RelicInstance
}

export const ItemInstantiator = {
  instantiateRelic,
}
