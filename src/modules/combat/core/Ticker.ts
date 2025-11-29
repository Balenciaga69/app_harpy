import { CombatContext } from './CombatContext'
export class Ticker {
  private context: CombatContext
  constructor(context: CombatContext) {
    this.context = context
  }
  public tick(): void {
    this.context.eventBus.emit('tick:start', { tick: this.context.currentTick })
    // 2. 處理時間流逝邏輯 (例如 DoT, Buff 持續時間)
    // 這裡未來會呼叫 System 來處理，而不是寫死在這裡
    this.context.currentTick++
    this.context.eventBus.emit('tick:end', { tick: this.context.currentTick })
  }
}
