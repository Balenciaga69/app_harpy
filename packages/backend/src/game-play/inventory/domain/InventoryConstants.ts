/**
 * Inventory Constants
 *
 * 庫存模組常數定義
 */

/** 倉庫容量限制（無限制） */
export const INVENTORY_MAX_SIZE = Number.MAX_SAFE_INTEGER

/** 遺物最大堆疊數量（無限制） */
export const RELIC_MAX_STACK = Number.MAX_SAFE_INTEGER

/** 預設操作結果訊息 */
export const INVENTORY_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  EQUIPMENT_ADDED: 'Equipment added to inventory',
  RELIC_ADDED: 'Relic added to inventory',
  EQUIPMENT_REMOVED: 'Equipment removed from inventory',
  RELIC_REMOVED: 'Relic removed from inventory',
  EQUIPMENT_EQUIPPED: 'Equipment equipped successfully',
  EQUIPMENT_UNEQUIPPED: 'Equipment unequipped successfully',
  ITEM_NOT_FOUND: 'Item not found in inventory',
  SLOT_OCCUPIED: 'Equipment slot is already occupied',
  SLOT_EMPTY: 'Equipment slot is empty',
  INVALID_SLOT: 'Invalid equipment slot',
  INVALID_OPERATION: 'Invalid operation',
} as const
