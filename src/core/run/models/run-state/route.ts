import type { RoomInfo } from './room.ts'
/**
 * Route Info
 *
 * Represents a selectable path in a chapter.
 * Contains all rooms the player will encounter on this route.
 */
export type RouteInfo = {
  readonly id: string
  readonly rooms: readonly RoomInfo[]
}
