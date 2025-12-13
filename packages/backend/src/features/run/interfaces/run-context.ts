import { RunState } from './run-state'
import type { RunStateType } from './run-state'
import type { RunProgress } from './run-progress'
/**
 * Run 的完整上下文資料
 * 代表一局遊戲的所有持續性資訊
 */
export interface RunContext {
  /** 唯一識別碼 */
  runId: string
  /** 當前狀態 */
  state: RunStateType
  /** 進度資訊 */
  progress: RunProgress
  /** 選擇的角色 ID */
  characterId: string | null
  /** 玩家金幣 */
  gold: number
  /** 是否存在續命道具 */
  hasReviveItem: boolean
  /** 開始時間戳 */
  startedAt: number
  /** 最後更新時間戳 */
  updatedAt: number
}
/**
 * 建立初始 Run Context
 */
export function createInitialContext(runId: string): RunContext {
  const now = Date.now()
  return {
    runId,
    state: RunState.UNINITIALIZED,
    progress: {
      chapter: 1,
      node: 1,
      totalNodesCleared: 0,
      isEndlessMode: false,
      difficultyScale: 1.0,
    },
    characterId: null,
    gold: 100, // 初始金幣
    hasReviveItem: false,
    startedAt: now,
    updatedAt: now,
  }
}
