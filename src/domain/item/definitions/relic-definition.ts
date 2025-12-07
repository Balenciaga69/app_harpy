import type { IItemDefinition } from './item-definition'
/**
 * IRelicDefinition
 *
 * 遺物的核心定義介面，繼承自 IItemDefinition。
 * 遺物可無限堆疊，具有堆疊相關屬性。
 */
export interface IRelicDefinition extends IItemDefinition {
  /** 是否可堆疊（同類型遺物） */
  readonly stackable: boolean
  /** 最大堆疊數量，0 表示無限制 */
  readonly maxStack: number
}
