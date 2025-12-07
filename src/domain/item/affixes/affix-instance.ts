/**
 * IAffixInstance
 *
 * 詞綴的動態實例介面。
 * 表示已生成的詞綴，包含具體數值。
 */
export interface IAffixInstance {
  /** 對應的詞綴定義 ID */
  readonly definitionId: string
  /** 擲骰後的實際數值 */
  readonly rolledValue: number
}
