/** 詞綴階級（可選，用於分層生成權重或 UI 顯示） */
export type AffixTier = 1 | 2 | 3 | 4 | 5
/** 詞綴分類標籤 */
export type AffixTag = 'attack' | 'defense' | 'mechanic' | 'legendary'
/**
 * IAffixDefinition
 *
 * 詞綴的靜態定義介面。
 * 決定詞綴可出現的屬性類型與數值範圍。
 */
export interface IAffixDefinition {
  /** 唯一識別碼 */
  readonly id: string
  /** 對應的效果模板 ID，用於生成戰鬥效果 */
  readonly effectTemplateId: string
  /** 數值下限 */
  readonly minValue: number
  /** 數值上限 */
  readonly maxValue: number
  /** 生成權重，數值越大越容易出現 */
  readonly weight: number
  /** 詞綴階級（可選），用於分層生成或 UI 顯示 */
  readonly tier?: AffixTier
  /** 分類標籤，支援複合（如 ['attack', 'legendary']） */
  readonly tags: readonly AffixTag[]
}
