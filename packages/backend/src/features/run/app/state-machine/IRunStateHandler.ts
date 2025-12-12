import { RunContext } from '../../interfaces/models/run-context'
/**
 * 狀態處理器介面
 * 每個狀態實作自己的進入/退出邏輯
 */
export interface IRunStateHandler {
  /**
   * 進入此狀態時執行
   */
  enter(_context: RunContext): Promise<void> | void
  /**
   * 離開此狀態時執行
   */
  exit(_context: RunContext): Promise<void> | void
  /**
   * 此狀態可轉換到哪些狀態
   */
  getAllowedTransitions(): string[]
}
