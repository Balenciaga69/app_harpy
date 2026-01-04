/**
 * Pre-Combat 上下文 - 戰鬥前準備階段的狀態
 * 職責：定義戰鬥前的所有狀態與轉換規則
 * 依賴：PreCombatModifier
 */
//TODO: AI生成內容/等待確認
import { PreCombatModifier, PreCombatModifierRecord } from './PreCombatModifier'

// TODO: 定義 PreCombat 狀態
// - SELECTING: 玩家正在選擇修飾
// - CONFIRMED: 玩家已確認修飾，準備進入戰鬥
// - EXPIRED: 修飾已過期（如刷新超時）
export type PreCombatState = 'SELECTING' | 'CONFIRMED' | 'EXPIRED'

/**
 * 修飾選擇記錄
 */
export interface ModifierSelectionRecord {
  readonly selectedModifierId: string
  readonly refreshCount: number
  readonly totalRefreshCost: number
}

/**
 * Pre-Combat 共用上下文
 */
export interface PreCombatSharedContext {
  readonly state: PreCombatState
  readonly availableModifiers: ReadonlyArray<PreCombatModifier>
  readonly currentSelection: ModifierSelectionRecord | null
  readonly generatedAt: number // timestamp
}

/**
 * Pre-Combat 選擇中狀態
 * 玩家可以查看修飾並決定接受或刷新
 */
export type PreCombatSelectingContext = {
  readonly state: 'SELECTING'
} & PreCombatSharedContext

/**
 * Pre-Combat 已確認狀態
 * 玩家已選擇修飾，可進入戰鬥
 */
export type PreCombatConfirmedContext = {
  readonly state: 'CONFIRMED'
} & PreCombatSharedContext

/**
 * Pre-Combat 完整上下文
 */
export type PreCombatContext = PreCombatSelectingContext | PreCombatConfirmedContext

/**
 * Pre-Combat 記錄 - 序列化格式
 * 用於存儲與恢復
 */
export interface PreCombatContextRecord {
  // TODO: 定義記錄格式
  state: PreCombatState
  availableModifiers: ReadonlyArray<PreCombatModifierRecord>
  currentSelection: ModifierSelectionRecord | null
  generatedAt: number
}
