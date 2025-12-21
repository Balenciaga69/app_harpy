import { ICharacterContext } from '../../domain/context/ICharacterContext'
import { IStashContext } from '../../domain/context/IStashContext'
import { ItemInstance } from '../../domain/item/itemInstance'
import { TagType } from '../../shared/models/TagType'
import { TemplateStore } from '../store/TemplateStore'

const countTags = (items: ItemInstance[], templateStore: TemplateStore): Partial<Record<TagType, number>> => {
  const ids = items.map((e) => e.id).flat()
  const tags = templateStore.getManyItems(ids).flatMap((item) => item.tags)
  const tagCntMap: Partial<Record<TagType, number>> = {}
  for (const tag of tags) {
    tagCntMap[tag] = (tagCntMap[tag] ?? 0) + 1
  }
  return tagCntMap
}

export const TagCounter = {
  countAllItemTags(charCtx: ICharacterContext, stashCtx: IStashContext, templateStore: TemplateStore) {
    const equipments = Object.values(charCtx.equipments).filter(Boolean)
    const relics = charCtx.relics
    const stashItems = stashCtx.items
    return countTags([...equipments, ...relics, ...stashItems], templateStore)
  },
  countEquippedTags(charCtx: ICharacterContext, templateStore: TemplateStore) {
    const equipments = Object.values(charCtx.equipments).filter(Boolean)
    return countTags(equipments, templateStore)
  },
  countRelicTags(charCtx: ICharacterContext, templateStore: TemplateStore) {
    return countTags(charCtx.relics, templateStore)
  },
}
