import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * 前置（Pre-battle）修飾器處理器（骨架）
 *
 * 負責生成可預測（deterministic）的 pre-battle modifiers 並廣播 'pre_battle:applied'。
 */
export class ModifierHandler implements IRunHandler {
  readonly name = 'ModifierHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: 訂閱 'run:started'、'room:entered'、'combat:started' 事件
    // TODO: 使用 seed 以確定性方式生成修飾器，並發出 `pre_battle:applied` 的 payload
    throw new Error('ModifierHandler not implemented')
  }
  dispose(): void {
    // TODO: 退訂（unsubscribe）所有事件
  }
}
