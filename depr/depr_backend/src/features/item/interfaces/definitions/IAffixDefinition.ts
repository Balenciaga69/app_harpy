/**
 * IAffixDefinition
 *
 * 詞綴定義介面。
 * 定義詞綴的基本屬性與效果模板。
 */
export interface IAffixDefinition {
  /** 詞綴唯一識別碼 */
  readonly id: string
  /** 對應的效果模板 ID */
  readonly effectTemplateId: string
  /** 最小數值 */
  readonly minValue: number
  /** 最大數值 */
  readonly maxValue: number
  /** 生成權重 */
  readonly weight: number
  /** 階級 */
  readonly tier: number
  /** 標籤列表 */
  readonly tags: readonly string[]
}
