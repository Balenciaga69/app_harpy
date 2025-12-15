/**
 * 變數類型
 */
export const VariableType = {
  /** 屬性修飾 */
  ATTRIBUTE_MODIFIER: 'ATTRIBUTE_MODIFIER',
  /** 異常狀態注入 */
  STATUS_EFFECT: 'STATUS_EFFECT',
  /** 復活率調整 */
  REVIVAL_RATE: 'REVIVAL_RATE',
  /** 大招充能效率 */
  ULTIMATE_CHARGE: 'ULTIMATE_CHARGE',
  /** 攻擊冷卻調整 */
  ATTACK_COOLDOWN: 'ATTACK_COOLDOWN',
  /** 傷害倍率 */
  DAMAGE_MULTIPLIER: 'DAMAGE_MULTIPLIER',
  /** 防禦倍率 */
  DEFENSE_MULTIPLIER: 'DEFENSE_MULTIPLIER',
} as const

export type VariableType = (typeof VariableType)[keyof typeof VariableType]

/**
 * 變數模板
 */
export interface IVariableTemplate {
  /** 模板 ID */
  id: string
  /** 變數類型 */
  type: VariableType
  /** 描述模板（支援參數替換） */
  descriptionTemplate: string
  /** 影響摘要模板 */
  impactSummaryTemplate: string
  /** 應用邏輯識別碼 */
  applyLogicIdentifier: string
  /** 持續時間範圍 [min, max]，-1 表示整場戰鬥 */
  durationRange: [number, number]
  /** 參數生成函數 */
  generateParameters: (difficulty: number, seed: number) => Record<string, unknown>
  /** 最低難度要求 */
  minDifficulty: number
  /** 權重（影響出現機率） */
  weight: number
}
