import type { CombatEventMap } from './combat-event-map'
export interface IEventBus {
  /* Subscribe to event */
  on<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void
  /* Unsubscribe from event */
  off<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void
  /* Publish event */
  emit<K extends keyof CombatEventMap>(event: K, payload: CombatEventMap[K]): void
  /* Listen to all events */
  onAll(handler: (type: keyof CombatEventMap, payload: any) => void): void
  /* Clear all listeners */
  clear(): void
}
