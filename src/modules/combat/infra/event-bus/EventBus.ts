/* eslint-disable @typescript-eslint/no-explicit-any */
import mitt from 'mitt'
import type { CombatEventMap } from './models/combat-event-map'
import type { IEventBus } from './models/event-bus'
export class EventBus implements IEventBus {
  // mitt instance for event management
  private emitter = mitt<CombatEventMap>()
  /** Subscribe to event */
  public on<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void {
    this.emitter.on(event, handler)
  }
  /** Unsubscribe */
  public off<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void {
    this.emitter.off(event, handler)
  }
  /** Publish event */
  public emit<K extends keyof CombatEventMap>(event: K, payload: CombatEventMap[K]): void {
    this.emitter.emit(event, payload)
  }
  /** Listen to all events (for Logger or Debug) */
  public onAll(handler: (type: keyof CombatEventMap, payload: any) => void): void {
    this.emitter.on('*', handler as any)
  }
  /** Clear all listeners (for cleanup after combat ends) */
  public clear(): void {
    this.emitter.all.clear()
  }
}
