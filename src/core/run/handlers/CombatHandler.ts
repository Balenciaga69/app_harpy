import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * 戰鬥處理器（骨架）
 *
 * 監聽 room:entered 事件並觸發戰鬥流程。
 * 尚未實作 - 此為未來開發保留的樣板。
 */
export class CombatHandler implements IRunHandler {
  readonly name = 'CombatHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: 訂閱 'room:entered' 事件
    // TODO: 檢查 roomType 是否為 'combat' | 'elite' | 'boss'
    // TODO: 在開始戰鬥前，確保 pre-battle modifiers 已生效：可監聽或發送 'pre_battle:applied'
    // TODO: 支援與 BetHandler 協同：允許在 CombatEngine 執行前下註/解析下注
    // TODO: 呼叫 CombatEngine 並發出 'combat:started'、'combat:ended'、'combat:victory' 或 'combat:defeat'
    throw new Error('CombatHandler not implemented')
  }
  dispose(): void {
    // TODO: 退訂（unsubscribe）所有事件
  }
}
