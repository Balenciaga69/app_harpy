import type { EquipmentRarity } from '../definitions'
import type { EquipmentSlot } from '../equipment-slot'
/**
 * IUIItemView
 *
 * UI 顯示需要的物品視角投影。
 * 只包含渲染所需的欄位，隔離戰鬥與庫存的關注點。
 * TODO: 未定案，目前依然會調整
 */
export interface IUIItemView {
  /** 物品唯一識別碼 */
  readonly id: string
  /** 顯示名稱 */
  readonly displayName: string
  /** 描述文字 */
  readonly description: string
  /** 圖示路徑 */
  readonly iconPath: string
  /** 稀有度 */
  readonly rarity: EquipmentRarity
  /** 裝備槽位（僅裝備有效） */
  readonly slot?: EquipmentSlot
  /** 價格 */
  readonly price: number
  /** 詞綴描述列表（已格式化供顯示） */
  readonly affixDescriptions: readonly string[]
}
