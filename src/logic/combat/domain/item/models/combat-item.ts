import type { IEffect } from '../../effect/models/effect'
import type { EquipmentSlot } from '@/domain/item'
/**
 * ICombatEquipment
 *
 * Combat Engine 內部使用的裝備介面。
 * 只包含戰鬥計算所需的資訊。
 */
export interface ICombatEquipment {
  readonly id: string
  readonly slot: EquipmentSlot
  readonly effects: readonly IEffect[]
}
/**
 * ICombatRelic
 *
 * Combat Engine 內部使用的遺物介面。
 * 支援堆疊機制，效果可隨堆疊數變化。
 */
export interface ICombatRelic {
  readonly id: string
  readonly name: string
  readonly effects: readonly IEffect[]
  readonly stackCount: number
}
