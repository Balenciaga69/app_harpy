import { ItemInstance } from '../../domain/item/itemInstance'
import { TagType } from '../../shared/models/TagType'
import { IAppContext } from '../context/interface/IAppContext'
// TODO: 該專案分類錯誤位置 記得更換
const countTags = (appCtx: IAppContext, items: ItemInstance[]): Partial<Record<TagType, number>> => {
  const { itemStore } = appCtx
  const ids = items.map((e) => e.id).flat()
  const tags = itemStore.getManyItems(ids).flatMap((item) => item.tags)
  const tagCntMap: Partial<Record<TagType, number>> = {}
  for (const tag of tags) {
    tagCntMap[tag] = (tagCntMap[tag] ?? 0) + 1
  }
  return tagCntMap
}

const recordToList = (record: Partial<Record<TagType, number>>) => {
  return Object.entries(record).map(([tag, count]) => ({ tag: tag as TagType, count }))
}

type CountResult = {
  record: Partial<Record<TagType, number>>
  toList: () => { tag: TagType; count: number }[]
}

export const TagCounter = {
  countAllItemTags(appCtx: IAppContext): CountResult {
    const { items } = appCtx.stashContext
    const { relics } = appCtx.characterContext
    const record = countTags(appCtx, [...relics, ...items])
    return { record, toList: () => recordToList(record) }
  },
  countEquippedTags(appCtx: IAppContext) {
    const equipped = Object.values(appCtx.characterContext.relics).filter(Boolean)
    const record = countTags(appCtx, equipped)
    return { record, toList: () => recordToList(record) }
  },
}
