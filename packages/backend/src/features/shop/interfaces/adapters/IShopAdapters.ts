import type { IEquipmentInstance, IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'

/**
 * 庫存介面（用於依賴注入）
 */
export interface IInventoryAdapter {
  getPlayerGold(): number
  updatePlayerGold(amount: number): void
  addItemToInventory(item: IEquipmentInstance | IRelicInstance): void
  removeItemFromInventory(itemId: string): void
  hasItem(itemId: string): boolean
}

/**
 * 難度適配器介面
 */
export interface IDifficultyAdapter {
  getCurrentDifficulty(): number
}

/**
 * 物品生成器介面
 */
export interface IItemGenerator {
  generateEquipment(definitionId: string, difficulty: number, seed: string): IEquipmentInstance
  generateRelic(definitionId: string): IRelicInstance
}
