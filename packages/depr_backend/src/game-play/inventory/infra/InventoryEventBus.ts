/**
 * Inventory Event Bus Implementation
 *
 * 使用 mitt 實作的 EventBus，供 Inventory 模組使用
 */
import mitt from 'mitt'
import type { IEventBus } from '../../../shared/event-bus'
import type { IInventoryEvents } from '../interfaces/IInventoryEvents'

export class InventoryEventBus implements IEventBus<IInventoryEvents> {
  private emitter = mitt<IInventoryEvents>()

  /** 訂閱事件 */
  public on<K extends keyof IInventoryEvents>(event: K, handler: (payload: IInventoryEvents[K]) => void): void {
    this.emitter.on(event, handler)
  }

  /** 取消訂閱 */
  public off<K extends keyof IInventoryEvents>(event: K, handler: (payload: IInventoryEvents[K]) => void): void {
    this.emitter.off(event, handler)
  }

  /** 發送事件 */
  public emit<K extends keyof IInventoryEvents>(event: K, payload: IInventoryEvents[K]): void {
    this.emitter.emit(event, payload)
  }

  /** 監聽所有事件（Logger/Debug 用） */
  public onAll(handler: (type: keyof IInventoryEvents, payload: any) => void): void {
    this.emitter.on('*', handler as any)
  }

  /** 清除所有 listener */
  public clear(): void {
    this.emitter.all.clear()
  }
}
