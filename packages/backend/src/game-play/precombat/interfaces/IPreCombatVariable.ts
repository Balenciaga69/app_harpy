/**
 * 賽前變數介面
 *
 * 代表一個會影響戰鬥的賽前注入變數
 */
export interface IPreCombatVariable {
  /** 變數唯一識別碼 */
  id: string
  /** 變數描述（供 UI 顯示） */
  description: string
  /** 應用邏輯識別碼（用於在 CombatEngine 中查找對應的效果處理器） */
  applyLogicIdentifier: string
  /** 持續時間（tick 數），若為 -1 則表示整場戰鬥 */
  durationTicks: number
  /** 影響摘要（簡短說明，如「雙方開局受 16 層冰緩」） */
  impactSummary: string
  /** 變數參數（彈性資料，供 CombatEngine 使用） */
  parameters?: Record<string, unknown>
}
