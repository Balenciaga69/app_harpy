import type { RoomType } from '../run-event-map/room-type.ts'
/**
 * 房間資訊
 *
 * 表示路線中的單一房間。
 */
export type RoomInfo = {
  readonly id: string
  readonly type: RoomType
  readonly data: RoomData
}
/**
 * 房間資料
 *
 * 根據房間類型（room type）定義的房間專屬資料。
 */
export type RoomData = CombatRoomData | EventRoomData | ShopRoomData
export type CombatRoomData = {
  readonly enemies: readonly string[]
  readonly difficulty: number
}
export type EventRoomData = {
  readonly eventId: string
}
export type ShopRoomData = {
  readonly shopId: string
  readonly shopType?: 'slot' | 'store' | 'bet'
}
