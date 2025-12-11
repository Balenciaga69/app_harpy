/* eslint-disable @typescript-eslint/no-explicit-any */
import mitt from 'mitt'
import type { CombatEventMap } from './models/combat-event-map'
import type { IEventBus } from '@/app/shared/event-bus'
export interface ICombatEventBus extends IEventBus<CombatEventMap> {
  onAll(handler: (type: keyof CombatEventMap, payload: any) => void): void
}
export class CombatEventBus implements ICombatEventBus {
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
