/** 詞綴階級 */
export type AffixTier = 1 | 2 | 3 | 4 | 5
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
  /** 詞綴階級，影響生成權重 */
  readonly tier: AffixTier
  /** 生成權重，數值越大越容易出現 */
  readonly weight: number
}
