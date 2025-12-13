import mitt from 'mitt'
import type { CombatEventMap } from '../../interfaces/event-bus/CombatEventMap'
import type { ICombatEventBus } from '../../interfaces/event-bus/ICombatEventBus'
export class EventBus implements ICombatEventBus {
  private emitter = mitt<CombatEventMap>()
  public on<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void {
    this.emitter.on(event, handler)
  }
  public off<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void {
    this.emitter.off(event, handler)
  }
  public emit<K extends keyof CombatEventMap>(event: K, payload: CombatEventMap[K]): void {
    this.emitter.emit(event, payload)
  }
  public onAll(handler: (type: keyof CombatEventMap, payload: any) => void): void {
    this.emitter.on('*', handler as any)
  }
  public clear(): void {
    this.emitter.all.clear()
  }
}
