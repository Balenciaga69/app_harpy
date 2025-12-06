import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * 投注 / 商店 處理器（骨架）
 *
 * 處理商店進入、下註、解析投注結果與商店購買流程。
 * 尚未實作 - 此檔為未來開發預留的樣板。
 */
export class BetHandler implements IRunHandler {
  readonly name = 'BetHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: 訂閱 'shop:entered'、'bet:placed' 事件
    // TODO: 驗證投注載荷並將其持久化到 RunState / persistence
    // TODO: 當結果確定時發出 'bet:resolved'、'bet:won'、'bet:lost'
    throw new Error('BetHandler not implemented')
  }
  dispose(): void {
    // TODO: 退訂（unsubscribe）所有事件
  }
}
