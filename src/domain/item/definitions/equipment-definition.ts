import type { IItemDefinition } from './item-definition'
import type { EquipmentSlot } from '../equipment-slot'
/** 裝備稀有度 */
export type EquipmentRarity = 'common' | 'magic' | 'rare' | 'legendary'
/**
 * IEquipmentDefinition
 *
 * 裝備的核心定義介面，繼承自 IItemDefinition。
 * 包含裝備特有的槽位與基礎屬性。
 */
export interface IEquipmentDefinition extends IItemDefinition {
  /** 裝備槽位 */
  readonly slot: EquipmentSlot
  /** 基礎屬性數值（鍵為屬性 ID，值為數值） */
  readonly baseStats: Readonly<Record<string, number>>
  /** 稀有度 */
  readonly rarity: EquipmentRarity
}
