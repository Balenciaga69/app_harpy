import type { RoomType } from '../run-event-map/room.ts'
/**
 * Room Info
 *
 * Represents a single room in a route.
 */
export type RoomInfo = {
  readonly id: string
  readonly type: RoomType
  readonly data: RoomData
}
/**
 * Room Data
 *
 * Room-specific data based on room type.
 */
export type RoomData = CombatRoomData | EventRoomData
export type CombatRoomData = {
  readonly enemies: readonly string[]
  readonly difficulty: number
}
export type EventRoomData = {
  readonly eventId: string
}
