import type { IRunEventBus } from '../infra/event-bus'
import type { IRunHandler } from './run-handler'
/**
 * 死亡處理器（骨架）
 *
 * 監聽 combat:defeat 事件並處理玩家死亡/復活邏輯。
 * 尚未實作 - 此為未來開發保留的樣板。
 * 這一段可能要刪除，因為我認為
 */
export class DeathHandler implements IRunHandler {
  readonly name = 'DeathHandler'
  initialize(_eventBus: IRunEventBus): void {
    // TODO: 訂閱 'combat:defeat' 事件
    // TODO: 檢查是否擁有復活道具並根據規範計算復活機率
    //      - 基礎復活機率: 3% 至 50%。允許透過道具或聖物修改
    //      - 若發生復活，將 HP 恢復至某個百分比（10%~100%），並清除所有負面狀態與減益
    // TODO: 若未復活，與 ShopHandler 協調以提供補償（shop:entered）或發出 'run:game-over'
    // TODO: 根據情況發出 'player:died' 或 'player:revived'（Payload 應包含詳細資訊）
    throw new Error('DeathHandler not implemented')
  }
  dispose(): void {
    // TODO: 退訂（unsubscribe）所有事件
  }
}
