import type { RouteInfo } from './route.ts'
import type { PendingBet } from './bet'
import type { SceneState } from '../scene-state'
/**
 * 執行狀態（Run State）
 *
 * 表示當前執行進度的純資料物件。
 * 完全可序列化（可用於存檔/載入）。
 */
export type RunState = {
  readonly floor: number
  readonly chapter: number
  readonly scene: SceneState
  readonly currentRoute: RouteInfo | null
  readonly routeOptions: readonly RouteInfo[]
  readonly roomIndex: number
  readonly seed: string
  /** 可選的 pending bets，必須可序列化以確保投注結果具確定性 */
  readonly pendingBets?: readonly PendingBet[]
}
