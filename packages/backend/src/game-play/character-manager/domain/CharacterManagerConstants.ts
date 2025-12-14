// 角色管理器常數
export class CharacterManagerConstants {
  // 錯誤訊息模板
  static readonly ERROR_MESSAGES = {
    CHARACTER_NOT_FOUND: 'Character with ID "{0}" not found',
    INVALID_CHARACTER_STATE: 'Character "{0}" is in invalid state: {1}',
    DEFINITION_NOT_FOUND: 'Character definition "{0}" not found',
    STORAGE_SAVE_FAILED: 'Failed to save character "{0}": {1}',
    STORAGE_LOAD_FAILED: 'Failed to load character "{0}": {1}',
    PANEL_CALCULATION_FAILED: 'Failed to calculate panel for character "{0}": {1}',
    INVENTORY_NOT_FOUND: 'Inventory "{0}" not found for character',
  } as const

  // 角色實例限制
  static readonly LIMITS = {
    MAX_NAME_LENGTH: 50,
    MIN_NAME_LENGTH: 1,
  } as const

  // 預設值
  static readonly DEFAULTS = {
    INITIAL_STATUS: 'ACTIVE',
    REVIVE_COUNT: 0,
    TOTAL_COMBATS: 0,
    VICTORIES: 0,
    DEFEATS: 0,
  } as const
}
