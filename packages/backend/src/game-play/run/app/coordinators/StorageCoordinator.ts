import { RunContext } from '../../interfaces/run-context'
/**
 * 存檔協調器
 * 封裝與 PersistentStorage 的互動邏輯
 */
export class StorageCoordinator {
  /**
   * 儲存檢查點
   */
  async saveCheckpoint(_context: RunContext): Promise<void> {
    // TODO: 調用 PersistentStorage.save()
  }
  /**
   * 載入檢查點
   */
  async loadCheckpoint(_checkpointId: string): Promise<RunContext> {
    // TODO: 調用 PersistentStorage.load()
    throw new Error('尚未實作')
  }
  /**
   * 刪除檢查點
   */
  async deleteCheckpoint(_checkpointId: string): Promise<void> {
    // TODO: 調用 PersistentStorage.delete()
  }
}
