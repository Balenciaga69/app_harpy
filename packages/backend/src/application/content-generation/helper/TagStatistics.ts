import { ItemInstance } from '../../../domain/item/itemInstance'
import { TagType } from '../../../shared/models/TagType'
import { IAppContext } from '../../core-infrastructure/context/interface/IAppContext'
// TODO: 該專案分類錯誤位置 記得更換
/** 統計物品標籤頻率的輔助工具，支援分類統計（所有物品、已裝備等） */
/** 計算物品清單中各標籤的出現次數 */
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
/** 將統計記錄轉換為陣列格式，便於排序與篩選 */
const recordToList = (record: Partial<Record<TagType, number>>) => {
  return Object.entries(record).map(([tag, count]) => ({ tag: tag as TagType, count }))
}
/** 物品標籤統計結果：包含記錄（映射）與轉換方法 */
type CountResult = {
  record: Partial<Record<TagType, number>>
  toList: () => { tag: TagType; count: number }[]
}
/** 物品標籤統計工具：統計所有物品或特定類別物品的標籤頻率 */
export const TagStatistics = {
  /** 統計倉庫與已裝備物品的所有標籤頻率 */
  countAllItemTags(appCtx: IAppContext): CountResult {
    const items = appCtx.contexts.stashContext.items
    const relics = appCtx.contexts.characterContext.relics
    const record = countTags(appCtx, [...relics, ...(Array.isArray(items) ? items : [])])
    return { record, toList: () => recordToList(record) }
  },
  /** 統計已裝備聖物的標籤頻率 */
  countEquippedTags(appCtx: IAppContext) {
    const equipped = appCtx.contexts.characterContext.relics.filter(Boolean)
    const record = countTags(appCtx, equipped)
    return { record, toList: () => recordToList(record) }
  },
}
