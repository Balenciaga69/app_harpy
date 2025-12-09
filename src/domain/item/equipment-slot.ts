/**
 * Equipment Slot Types
 *
 * 裝備槽位類型定義。
 * 槽位僅作為外部限制，戰鬥引擎不區分部位。
 * 新增部位只需擴充此類型，無需修改引擎核心。
 */
export type EquipmentSlot = 'weapon' | 'helmet' | 'armor' | 'necklace' | 'boots' | 'gloves' // 手套槽位
