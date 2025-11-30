import type { CombatContext } from '../../context'
import type { DamageEvent } from '../models'
/**
 * DamageStep 介面
 *
 * 定義傷害計算流程中每個步驟的統一介面
 */
export interface IDamageStep {
  /**
   * 執行此步驟的邏輯
   * @returns 是否應該繼續執行後續步驟 (false = 提前終止流程)
   */
  execute(event: DamageEvent, context: CombatContext): boolean
}
