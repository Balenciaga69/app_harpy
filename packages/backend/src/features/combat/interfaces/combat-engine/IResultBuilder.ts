import type { CombatResult } from './CombatResult'

/**
 * 戰鬥結果建構器介面
 *
 * 負責建構最終戰鬥結果
 */
export interface IResultBuilder {
  /**
   * 建構戰鬥結果
   * @returns 戰鬥結果
   */
  build(): CombatResult
}
