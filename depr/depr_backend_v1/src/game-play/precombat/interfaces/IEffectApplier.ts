import type { IPreCombatVariable } from './IPreCombatVariable'

/**
 * 戰鬥引擎注入格式
 *
 * PreCombat 變數轉換為 CombatEngine 可接受的格式
 */
export interface ICombatInjectionPayload {
  /** 變數列表 */
  variables: IPreCombatVariable[]
  /** 序列化時間戳記 */
  serializedAt: number
}

/**
 * 效果應用器介面
 *
 * 將 PreCombat 變數轉換為 CombatEngine 可接受的注入資料
 */
export interface IEffectApplier {
  /**
   * 序列化變數為戰鬥引擎注入格式
   * @param variables 變數列表
   * @returns 注入 payload
   */
  serializeForCombat(variables: IPreCombatVariable[]): ICombatInjectionPayload

  /**
   * 驗證變數格式
   * @param variables 變數列表
   * @returns 是否有效
   */
  validateVariables(variables: IPreCombatVariable[]): boolean
}
