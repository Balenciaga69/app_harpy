import type { IAffixInstance } from '../affixes'
import type { EquipmentSlot } from '../equipment-slot'
/**
 * IInventoryItemView
 *
 * Inventory 模組需要的物品視角投影。
 * 包含管理庫存所需的欄位，隔離戰鬥效果的實作細節。
 * TODO: 未定案，目前依然會調整
 */
export interface IInventoryItemView {
  /** 物品唯一識別碼 */
  readonly id: string
  /** 對應的物品定義 ID */
  readonly definitionId: string
  /** 已生成的詞綴實例列表 */
  readonly affixInstances: readonly IAffixInstance[]
  /** 裝備槽位（僅裝備有效） */
  readonly slot?: EquipmentSlot
  /** 堆疊數量（僅遺物有效） */
  readonly stackCount?: number
}
