import { ItemInstance } from '../../../domain/item/itemInstance'
import { TagType } from '../../../shared/models/TagType'
import { IAppContext } from '../../context/interface/IAppContext'
// TODO: 該專案分類錯誤位置 記得更換
const countTags = (appCtx: IAppContext, items: ItemInstance[]): Partial<Record<TagType, number>> => {
  const itemStore = appCtx.configStore.itemStore
  const ids = items.map((e) => e.id)
  const tags = itemStore.getManyItems(ids).flatMap((item) => item.tags)
  const tagCntMap: Partial<Record<TagType, number>> = {}
  for (const tag of tags) {
    tagCntMap[tag as TagType] = (tagCntMap[tag as TagType] ?? 0) + 1
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
export const TagStatistics = {
  /** 找出所有物品標籤的計數 */
  countAllItemTags(appCtx: IAppContext): CountResult {
    const items = appCtx.contexts.stashContext.items
    const relics = appCtx.contexts.characterContext.relics
    const record = countTags(appCtx, [...relics, ...(Array.isArray(items) ? items : [])])
    return { record, toList: () => recordToList(record) }
  },
  /** 找出已裝備物品標籤的計數 */
  countEquippedTags(appCtx: IAppContext) {
    const equipped = appCtx.contexts.characterContext.relics.filter(Boolean)
    const record = countTags(appCtx, equipped)
    return { record, toList: () => recordToList(record) }
  },
}
