/**
 * Item Instance Definitions
 *
 * 定義物品實例的接口。
 * 物品實例是基於定義生成的具體物件，具有唯一 ID 和隨機屬性。
 */
import type { EquipmentRarity } from './equipment-definition'
/**
 * 裝備實例（簡化版，未來可擴充）
 */
export interface IEquipmentInstance {
  readonly id: string
  readonly definitionId: string
  readonly rarity: EquipmentRarity
  readonly affixes: Array<{ affixId: string; value: number }>
}
/**
 * 遺物實例（簡化版）
 */
export interface IRelicInstance {
  readonly id: string
  readonly definitionId: string
  readonly stackCount: number
}
