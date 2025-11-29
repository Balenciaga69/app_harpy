export interface CombatLogEntry {
  tick: number
  eventType: string
  sourceId?: string
  targetId?: string
  payload: Record<string, unknown>
}
