/** 支援版本控制的上下文基底介面，用於樂觀鎖並發控制 */
export interface WithRunIdAndVersion {
  /** Run ID：用於識別遊戲進度 */
  runId: string
  /** 版本號：用於樂觀鎖檢測並發衝突 */
  version: number
}
