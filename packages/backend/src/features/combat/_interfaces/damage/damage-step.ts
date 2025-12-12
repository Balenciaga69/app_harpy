import type { DamageEvent } from './damage-event'
import type { ICombatContext } from '@/features/combat/context'

/**
 * IDamageStep
 *
 * 傷害計算步驟介面，定義每個步驟的執行契約。
 * 步驟負責處理特定階段的邏輯，並決定是否繼續流程。
 */
export interface IDamageStep {
  /**
   * 執行步驟
   * @param event 傷害事件
   * @param context 戰鬥上下文
   * @returns 是否繼續執行下個步驟
   */
  execute(event: DamageEvent, context: ICombatContext): boolean
}
