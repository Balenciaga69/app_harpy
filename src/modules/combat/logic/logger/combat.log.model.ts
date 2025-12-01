import type { CombatEventMap } from '../../infra/event-bus'
export interface CombatLogEntry {
  tick: number
  eventType: keyof CombatEventMap
  sourceId?: string
  targetId?: string
  payload: Record<string, unknown>
}
