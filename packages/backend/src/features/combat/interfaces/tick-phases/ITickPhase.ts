import type { ICombatContext } from '../context/ICombatContext'
/**
 *  tick 階段介面
 *
 * 代表 tick 處理管道中的單一階段。
 * 每個階段負責處理特定任務（特效、能量、攻擊等）。
 */
export interface ITickPhase {
  /** Phase identifier for debugging and replacement */
  readonly name: string
  /** Execute this phase's logic for the current tick */
  execute(context: ICombatContext, tick: number): void
  /** Optional cleanup when phase is removed or system disposed */
  dispose?(): void
}
