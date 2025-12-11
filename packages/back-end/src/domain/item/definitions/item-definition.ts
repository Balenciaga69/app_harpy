/**
 * IItemDefinition
 *
 * 物品的核心定義介面，作為裝備與遺物的基礎。
 * 純資料結構，可序列化為 JSON，跨語言友好。
 */
export interface IItemDefinition {
  /** 唯一識別碼 */
  readonly id: string
  /** 可用詞綴池 ID 列表,用於隨機生成詞綴 */
  readonly affixPoolIds: readonly string[]
  /** 最小詞綴數量 */
  readonly minAffixes: number
  /** 最大詞綴數量 */
  readonly maxAffixes: number
}
