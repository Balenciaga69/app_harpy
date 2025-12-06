import type { IEventBus } from '@/core/shared/event-bus'
import mitt from 'mitt'
import type { RunEventMap } from '../../models'
/** Run Event Bus Interface */
// TODO: The RunEventMap now includes shop/bet/pre_battle events; ensure all listeners/emitters validate payload shapes
export interface IRunEventBus extends IEventBus<RunEventMap> {}
/** Run Event Bus Implementation */
export class RunEventBus implements IRunEventBus {
  private emitter = mitt<RunEventMap>()
  public on<K extends keyof RunEventMap>(event: K, handler: (payload: RunEventMap[K]) => void): void {
    this.emitter.on(event, handler)
  }
  public off<K extends keyof RunEventMap>(event: K, handler: (payload: RunEventMap[K]) => void): void {
    this.emitter.off(event, handler)
  }
  public emit<K extends keyof RunEventMap>(event: K, payload: RunEventMap[K]): void {
    this.emitter.emit(event, payload)
  }
  public clear(): void {
    this.emitter.all.clear()
  }
}
