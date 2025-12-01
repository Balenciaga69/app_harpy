import type { CharacterSnapshot, CharacterId } from '../../domain/character'
/** 快照中的角色狀態 */
/** EventName:Payload */
export type CombatEventMap = {
  // combat
  'combat:start': void
  'combat:end': { winnerId: string }
  'combat:miss': { sourceId: CharacterId; targetId: CharacterId; tick: number }
  'combat:prevented': { sourceId: CharacterId; targetId: CharacterId; reason: string; tick: number }
  // tick
  'tick:start': { tick: number }
  'tick:end': { tick: number }
  'ticker:stopped': { tick: number }
  // entity
  'entity:damage': { targetId: CharacterId; amount: number; sourceId?: CharacterId }
  'entity:heal': { targetId: CharacterId; amount: number }
  'entity:death': { targetId: CharacterId }
  'entity:attack': { sourceId: CharacterId; targetId: CharacterId; tick: number }
  'entity:critical': { sourceId: CharacterId; targetId: CharacterId; multiplier: number; tick: number }
  // snapshot
  'tick:snapshot': {
    tick: number
    entities: CharacterSnapshot[]
  }
}
