import type { RoomInfo } from '../../run-state/room.ts'
import type { RunState } from '../../run-state/run.ts'
import type { RoomType } from '../room'
// === RunEngine emitted events ===
export type RunStartedPayload = {
  seed: string
  floor: number
}
export type RunLoadedPayload = {
  runState: RunState
}
export type RouteSelectedPayload = {
  routeIndex: number
  rooms: readonly RoomInfo[]
}
export type RoomEnteredPayload = {
  roomType: RoomType
  roomData: RoomInfo
}
export type FloorChangedPayload = {
  floor: number
  chapter: number
}
export type ChapterChangedPayload = {
  chapter: number
}
