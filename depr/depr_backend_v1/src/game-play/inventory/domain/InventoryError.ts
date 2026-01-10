/**
 * Inventory Error
 *
 * 庫存模組錯誤類別
 */
export class InventoryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InventoryError'
  }
}

export class EquipmentSlotError extends InventoryError {
  constructor(message: string) {
    super(message)
    this.name = 'EquipmentSlotError'
  }
}

export class ItemNotFoundError extends InventoryError {
  constructor(itemId: string) {
    super(`Item not found: ${itemId}`)
    this.name = 'ItemNotFoundError'
  }
}

export class InvalidOperationError extends InventoryError {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidOperationError'
  }
}
