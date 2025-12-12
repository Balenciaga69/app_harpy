import type { CombatEventMap } from './CombatEventMap'

/**
 * ICombatEventBus
 *
 * Interface for combat event bus.
 * Provides event pub/sub functionality for combat system.
 */
export interface ICombatEventBus {
  on<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void
  off<K extends keyof CombatEventMap>(event: K, handler: (payload: CombatEventMap[K]) => void): void
  emit<K extends keyof CombatEventMap>(event: K, payload: CombatEventMap[K]): void
  onAll(handler: (type: keyof CombatEventMap, payload: any) => void): void
  clear(): void
}
