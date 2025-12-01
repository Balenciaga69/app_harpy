import type { AttributeType } from './attribute.core.model'
/** 屬性修飾器  */
export interface AttributeModifier {
  readonly id: string
  readonly type: AttributeType
  readonly value: number
  readonly mode: 'add' | 'multiply'
  readonly source: string
}
/**
 * 修飾器執行順序優先級
 *
 * 設計理念：
 * - 控制不同來源的屬性修飾器計算順序，確保遊戲機制的正確性。
 * - 數值越小越先執行，數值越大越後執行。
 * - 配合 AttributeCalculator 的 sortModifiersByPriority 方法使用。
 *
 * 使用場景：(暫定，遊戲機制尚未確認)
 * - LOWEST (0): 基礎懲罰效果（如疾病、詛咒）
 * - LOW (100): 臨時減益效果（如減速、虛弱）
 * - NORMAL (500): 一般 Buff/Debuff、裝備屬性（預設值）
 * - HIGH (900): 精英效果、套裝加成
 * - HIGHEST (1000): 聖物加成、終極被動
 *
 * 當前狀態：
 * - ✅ AttributeCalculator 已實現優先級排序邏輯
 * - ⚠️ 目前所有 Modifier 都使用 NORMAL 優先級（尚未實裝差異化）
 *
 * TODO: 待實裝範例：
 * - 實裝聖物系統時，設置 priority: ModifierPriority.HIGHEST
 * - 實裝套裝效果時，設置 priority: ModifierPriority.HIGH
 * - 實裝詛咒/疾病效果時，設置 priority: ModifierPriority.LOWEST
 *
 * 注意事項：
 * - 如果所有 Modifier 都使用相同優先級，則按照添加順序執行。
 * - 修改優先級可能影響最終屬性計算結果，需謹慎調整。
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
/** 擴展的屬性修飾器 (支援優先級) */
export interface AttributeModifierEx extends AttributeModifier {
  readonly priority: ModifierPriorityType
}
