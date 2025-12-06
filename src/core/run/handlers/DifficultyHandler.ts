import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * 難度處理器（骨架）
 *
 * 監聽 floor:changed 事件並更新難度乘數（multiplier）。
 * 尚未實作 - 此為未來開發保留的樣板。
 */
export class DifficultyHandler implements IRunHandler {
  readonly name = 'DifficultyHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: 訂閱 'floor:changed' 事件
    // TODO: 根據 floor/chapter 與可選的 RunConfig 計算難度乘數
    // TODO: 發出 'difficulty:updated' 事件
    // TODO: 此乘數應對 CombatEngine 可見，並可能影響敵人強度、獎勵與 pre_battle modifiers
    throw new Error('DifficultyHandler not implemented')
  }
  dispose(): void {
    // TODO: 退訂（unsubscribe）所有事件
  }
}
