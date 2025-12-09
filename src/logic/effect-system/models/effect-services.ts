import type { ICharacterFacade } from './character-facade'

/**
 * Effect 基礎服務介面
 *
 * 定義 Effect 執行時需要的最小服務集。
 * 此介面不包含任何戰鬥專屬邏輯，可在戰鬥內外使用。
 */
export interface IEffectServices {
  /**
   * 取得角色操作介面
   */
  getCharacter(characterId: string): ICharacterFacade
}

/**
 * 戰鬥專屬 Effect 服務介面
 *
 * 擴展基礎服務，添加戰鬥專屬功能。
 * 僅在戰鬥內使用，戰鬥外的 Effect 不應依賴此介面。
 */
export interface ICombatEffectServices extends IEffectServices {
  /**
   * 發送事件（用於日誌記錄）
   */
  emitEvent(eventName: string, payload: unknown): void

  /**
   * 取得當前 tick（用於時間相關邏輯）
   */
  getCurrentTick(): number

  /**
   * 取得隨機數（用於機率計算）
   */
  random(): number
}
