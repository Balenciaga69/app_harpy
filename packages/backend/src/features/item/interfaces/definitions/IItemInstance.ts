/**
 * Item Instance Definitions
 *
 * 定義物品實例的接口。
 * 物品實例是基於定義生成的具體物件，具有唯一 ID 和隨機屬性。
 */
import type { IAffixInstance } from '../affixes'
import type { EquipmentSlot } from '../equipment-slot'
import type { ItemRarity } from './equipment-definition'
/**
 * 裝備實例（簡化版，未來可擴充）
 */
export interface IEquipmentInstance {
  readonly id: string
  readonly definitionId: string
  readonly slot: EquipmentSlot
  readonly rarity: ItemRarity
  readonly affixes: IAffixInstance[]
}
/**
 * 遺物實例（簡化版）
 */
export interface IRelicInstance {
  readonly id: string
  readonly definitionId: string
  readonly stackCount: number
  readonly rarity: ItemRarity
  readonly affixes: IAffixInstance[]
}
