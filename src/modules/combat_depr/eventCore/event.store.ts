/** 按 Tick 執行事件 Queue的 儲存庫 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand'
import type { CombatEventType } from './combatEvent.type'
/** 預定事件 - 綁定於特定 tick 的排程事件 */
interface NormalEvent {
  type: CombatEventType
  tick: number
  payload: any
}
/** 即時事件 - 需要立即處理的插隊事件 */
interface ImmediateEvent {
  type: CombatEventType
  payload: any
}
interface EventStore {
  NormalEvents: NormalEvent[]
  addNormalEvent: (event: NormalEvent) => void
  /** 取出指定 tick 的所有事件並從佇列移除 */
  takeNormalEventsAtTick: (tick: number) => NormalEvent[]
  ImmediateEvents: ImmediateEvent[]
  addImmediateEvent: (event: ImmediateEvent) => void
  /** 取出佇列首位事件（FIFO），類似 Array.shift() */
  shiftImmediateEvent: () => ImmediateEvent | undefined
  /** 清空所有事件佇列 */
  clear: () => void
}
export const useEventStore = create<EventStore>((set) => ({
  NormalEvents: [],
  addNormalEvent: (event: NormalEvent) => set((state) => ({ NormalEvents: [...state.NormalEvents, event] })),
  takeNormalEventsAtTick: (tick: number) => {
    let taken: NormalEvent[] = []
    set((state) => {
      taken = state.NormalEvents.filter((e) => e.tick === tick)
      return { NormalEvents: state.NormalEvents.filter((e) => e.tick !== tick) }
    })
    return taken
  },
  ImmediateEvents: [],
  addImmediateEvent: (event: ImmediateEvent) =>
    set((state) => ({ ImmediateEvents: [...state.ImmediateEvents, event] })),
  shiftImmediateEvent: () => {
    let first: ImmediateEvent | undefined
    set((state) => {
      first = state.ImmediateEvents[0]
      return { ImmediateEvents: state.ImmediateEvents.slice(1) }
    })
    return first
  },
  clear: () => set({ NormalEvents: [], ImmediateEvents: [] }),
}))
