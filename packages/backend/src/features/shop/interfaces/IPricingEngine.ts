import type { ItemRarity } from '@/features/item/interfaces/definitions/IEquipmentDefinition'

/**
 * 裝備稀有度類型（來自 item 模組）
 */
export type EquipmentRarity = ItemRarity

/**
 * 定價引擎介面
 */
export interface IPricingEngine {
  calculateBuyPrice(rarity: EquipmentRarity, difficulty: number, chapter: number): number
  calculateSellPrice(rarity: EquipmentRarity, difficulty: number, chapter: number): number
}
