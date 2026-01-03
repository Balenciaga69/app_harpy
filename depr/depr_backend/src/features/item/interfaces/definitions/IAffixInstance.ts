/**
 * IAffixInstance
 *
 * 詞綴實例介面。
 * 詞綴實例是基於定義生成的具體物件，具有唯一 ID 和隨機屬性。
 */
export interface IAffixInstance {
  /** 對應的詞綴定義 ID */
  readonly definitionId: string
  /** 擲骰產生的數值 */
  readonly rolledValue: number
}
