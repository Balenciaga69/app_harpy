export interface IEventBus<EventMap> {
  /** 訂閱事件 */
  on<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void
  /** 取消訂閱 */
  off<K extends keyof EventMap>(event: K, handler: (payload: EventMap[K]) => void): void
  /** 發送事件 */
  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void
  /** 監聽所有事件（Logger/Debug 用） */
  onAll?(handler: (type: keyof EventMap, payload: any) => void): void
  /** 清除所有 listener */
  clear(): void
}
