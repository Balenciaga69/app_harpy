import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * 儲存（Persistence）處理器（骨架）
 *
 * 監聽執行相關事件並負責自動存檔。
 * 尚未實作 - 此為未來開發保留的樣板。
 */
export class PersistenceHandler implements IRunHandler {
  readonly name = 'PersistenceHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: 訂閱 'floor:changed'、'reward:claimed'、'run:*' 等事件
    // TODO: 確保 bet/shop 狀態與 RNG seed 被持久化，讓回放與投注驗證保持確定性
    // TODO: 建立包含 seed、floor、chapter、roomIndex、route options 與當前投注的存檔快照
    // TODO: 發出 'save:completed' 或 'save:failed'
    throw new Error('PersistenceHandler not implemented')
  }
  dispose(): void {
    // TODO: 退訂（unsubscribe）所有事件
  }
}
