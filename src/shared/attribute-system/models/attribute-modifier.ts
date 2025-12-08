import type { AttributeType } from '@/domain/attribute'

/**
 * 屬性修飾器
 *
 * 用於動態調整角色屬性的值。
 * 支援加法（add）和乘法（multiply）兩種模式。
 */
export interface AttributeModifier {
  readonly id: string
  readonly type: AttributeType
  readonly value: number
  readonly mode: 'add' | 'multiply'
  readonly source: string
}

/**
 * 修飾器執行優先級
 *
 * 設計理念：
 * - 控制不同來源的屬性修飾器的計算順序，確保遊戲機制的正確性。
 * - 數字越小越先執行，數字越大越後執行。
 * - 配合 AttributeCalculator 的 sortModifiersByPriority 方法使用。
 *
 * 使用場景：（暫定，遊戲機制尚未確認）
 * - LOWEST (0)：基礎懲罰效果（疾病、詛咒）
 * - LOW (100)：臨時 Debuff 效果（緩速、虛弱）
 * - NORMAL (500)：一般 Buff/Debuff、裝備屬性（預設值）
 * - HIGH (900)：精英效果、套裝加成
 * - HIGHEST (1000)：神器加成、大招被動
 *
 * 當前狀態：
 * - ✅ AttributeCalculator 已實現優先級排序邏輯
 * - ⚠️ 目前所有 Modifier 皆使用 NORMAL 優先級（尚未實現差異化）
 *
 * TODO: 待實現範例：
 * - 實作神器系統時，設定 priority: ModifierPriority.HIGHEST
 * - 實作套裝效果時，設定 priority: ModifierPriority.HIGH
 * - 實作詛咒/疾病效果時，設定 priority: ModifierPriority.LOWEST
 *
 * 注意事項：
 * - 若所有 Modifier 優先級相同，則依添加順序執行。
 * - 修改優先級可能影響最終屬性計算結果，請謹慎調整。
 */
export const ModifierPriority = {
  LOWEST: 0,
  LOW: 100,
  NORMAL: 500,
  HIGH: 900,
  HIGHEST: 1000,
} as const

/** 修飾器優先級類型 */
export type ModifierPriorityType = (typeof ModifierPriority)[keyof typeof ModifierPriority]

/** 擴展屬性修飾器（支援優先級） */
export interface AttributeModifierEx extends AttributeModifier {
  readonly priority: ModifierPriorityType
}
