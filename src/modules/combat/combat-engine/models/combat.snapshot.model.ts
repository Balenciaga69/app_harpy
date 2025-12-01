import type { CharacterSnapshot } from '../../infra/shared'
/**
 * 戰鬥快照
 *
 * 記錄某個 Tick 時的完整戰鬥狀態，用於回放與快速跳轉。
 */
export interface CombatSnapshot {
  /** 快照時間點 */
  tick: number
  /** 所有角色的狀態快照 */
  characters: CharacterSnapshot[]
}
