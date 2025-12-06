import type {
  RunStartedPayload,
  RunLoadedPayload,
  RouteSelectedPayload,
  RoomEnteredPayload,
  FloorChangedPayload,
  ChapterChangedPayload,
} from './payloads/run-payload'
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
} from './payloads/handle-payload'
export type RunEventMap = {
  // RunEngine events
  'run:started': RunStartedPayload
  'run:loaded': RunLoadedPayload
  'run:game-over': RunGameOverPayload
  'route:selected': RouteSelectedPayload
  'room:entered': RoomEnteredPayload
  'floor:changed': FloorChangedPayload
  'chapter:changed': ChapterChangedPayload
  'shop:entered': import('./payloads/run-payload').ShopEnteredPayload
  // Combat Handler events
  'combat:started': CombatStartedPayload
  'combat:ended': CombatEndedPayload
  'combat:victory': CombatVictoryPayload
  'combat:defeat': CombatDefeatPayload
  'pre_battle:applied': import('./payloads/handle-payload').PrebattleAppliedPayload
  // Death Handler events
  'player:died': PlayerDiedPayload
  'player:revived': PlayerRevivedPayload
  // Bet / Shop events (Handler emitted)
  'bet:placed': import('./payloads/handle-payload').BetPlacedPayload
  'bet:resolved': import('./payloads/handle-payload').BetResolvedPayload
  'bet:won': import('./payloads/handle-payload').BetResolvedPayload
  'bet:lost': import('./payloads/handle-payload').BetResolvedPayload
  // Reward Handler events
  'reward:generated': RewardGeneratedPayload
  'reward:claimed': RewardClaimedPayload
  // Difficulty Handler events
  'difficulty:updated': DifficultyUpdatedPayload
}
