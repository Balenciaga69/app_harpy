/** EventName:Payload */
export type CombatEventMap = {
  // combat
  'combat:start': void
  'combat:end': { winnerId: string }
  // tick
  'tick:start': { tick: number }
  'tick:end': { tick: number }
  // entity
  'entity:damage': { targetId: string; amount: number; sourceId?: string }
  'entity:heal': { targetId: string; amount: number }
  'entity:death': { targetId: string }
  // more events can be added here
}
