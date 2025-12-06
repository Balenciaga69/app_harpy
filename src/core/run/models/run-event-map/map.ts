import type {
  RunStartedPayload,
  RunLoadedPayload,
  RouteSelectedPayload,
  RoomEnteredPayload,
  FloorChangedPayload,
  ChapterChangedPayload,
} from './payloads/run'
import type {
  CombatStartedPayload,
  CombatEndedPayload,
  CombatVictoryPayload,
  CombatDefeatPayload,
  PlayerDiedPayload,
  PlayerRevivedPayload,
  RewardGeneratedPayload,
  RewardClaimedPayload,
  DifficultyUpdatedPayload,
  RunGameOverPayload,
} from './payloads/handlers'
export type RunEventMap = {
  // RunEngine events
  'run:started': RunStartedPayload
  'run:loaded': RunLoadedPayload
  'run:game-over': RunGameOverPayload
  'route:selected': RouteSelectedPayload
  'room:entered': RoomEnteredPayload
  'floor:changed': FloorChangedPayload
  'chapter:changed': ChapterChangedPayload
  // Combat Handler events
  'combat:started': CombatStartedPayload
  'combat:ended': CombatEndedPayload
  'combat:victory': CombatVictoryPayload
  'combat:defeat': CombatDefeatPayload
  // Death Handler events
  'player:died': PlayerDiedPayload
  'player:revived': PlayerRevivedPayload
  // Reward Handler events
  'reward:generated': RewardGeneratedPayload
  'reward:claimed': RewardClaimedPayload
  // Difficulty Handler events
  'difficulty:updated': DifficultyUpdatedPayload
}
