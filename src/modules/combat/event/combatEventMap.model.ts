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
  // snapshot
  'tick:snapshot': {
    tick: number
    entities: any[] // TODO: 定義更具體的 Entity Snapshot 類型
    // more events can be added here
  }
}
