/**
 * Character snapshot - pure data model
 *
 * Used to record character status at a specific time point
 * Mainly used for: replay system, log recording, event transmission
 */
export interface CharacterSnapshot {
  id: string
  name: string
  currentHp: number
  maxHp: number
  isDead: boolean
  effects: string[]
}
