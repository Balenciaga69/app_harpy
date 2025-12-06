// === Handler emitted events ===
export type CombatStartedPayload = {
  enemies: readonly string[]
}
export type CombatEndedPayload = {
  result: 'victory' | 'defeat'
  logs: readonly unknown[]
}
export type CombatVictoryPayload = {
  reward: unknown
}
export type CombatDefeatPayload = Record<string, never>
export type PlayerDiedPayload = {
  canRevive: boolean
}
export type PlayerRevivedPayload = Record<string, never>
export type RewardGeneratedPayload = {
  items: readonly unknown[]
  gold: number
}
export type RewardClaimedPayload = Record<string, never>
export type DifficultyUpdatedPayload = {
  multiplier: number
}
export type RunGameOverPayload = {
  floor: number
  chapter: number
}
export type BetPlacedPayload = {
  betId: string
  amount: number
  target: string
}
export type BetResolvedPayload = {
  betId: string
  result: 'won' | 'lost' | 'push'
  payout: number
}
export type PrebattleAppliedPayload = {
  modifiers: Record<string, unknown>
}
