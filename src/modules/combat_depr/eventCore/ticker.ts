import { eventEmitter } from './emitter'
import { useCombatStatusStore } from '../combatEngine/combatStatus.store'
import { useEventStore } from './event.store'
/** 戰鬥時鐘 - 驅動 tick 週期並協調 Normal/Immediate 事件的執行順序 */
export class Ticker {
  /** 執行單一 tick 週期：發送預定事件 → 清空即時事件 → 推進時間軸 */
  public tick(): void {
    const { currentTick, incrementTick } = useCombatStatusStore.getState()
    const { takeNormalEventsAtTick } = useEventStore.getState()
    const currTickNormalEvents = takeNormalEventsAtTick(currentTick)
    for (const normalEvent of currTickNormalEvents) {
      eventEmitter.emit(normalEvent.type, normalEvent.payload)
      if (this.#isCombatOver()) return
      this.#drainImmediateEvents()
      if (this.#isCombatOver()) return
    }
    this.#drainImmediateEvents()
    if (this.#isCombatOver()) return
    incrementTick()
  }
  /** 清空即時事件佇列，逐一發送直到為空 */
  #drainImmediateEvents(): void {
    const { shiftImmediateEvent } = useEventStore.getState()
    while (true) {
      const immediateEvent = shiftImmediateEvent()
      if (!immediateEvent) break
      eventEmitter.emit(immediateEvent.type, immediateEvent.payload)
      if (this.#isCombatOver()) return
    }
  }
  /** 檢查戰鬥是否結束 */
  #isCombatOver(): boolean {
    return useCombatStatusStore.getState().isCombatOver
  }
}
