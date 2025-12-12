import type { EquipmentSlot } from './EquipmentSlot'
import type { IItemDefinition } from './item-definition'
/** 裝備稀有度 */
export type ItemRarity = 'common' | 'magic' | 'rare' | 'legendary'
/**
 * IEquipmentDefinition
 *
 * 裝備的核心定義介面，繼承自 IItemDefinition。
 * 包含裝備特有的槽位與基礎屬性。
 */
export interface IEquipmentDefinition extends IItemDefinition {
  readonly slot: EquipmentSlot
  readonly rarity: ItemRarity
  /** 最小詞綴數量 */
  readonly minAffixes: number
  /** 最大詞綴數量 */
  readonly maxAffixes: number
  /** 可用的詞綴池 ID 列表 */
  readonly affixPoolIds: readonly string[]
}
