import type { ICombatContext } from '../interfaces/context/ICombatContext'
import type { ITickActionSystem } from '../interfaces/coordination/ITickActionSystem'
import { TickActionSystem } from '../app/coordination/TickActionSystem'

/**
 * 協調系統工廠
 *
 * 創建協調層的組件，避免 engine 層直接依賴 coordination 層實作
 */
export class CoordinationFactory {
  /** 創建 TickActionSystem 實例 */
  static createTickActionSystem(context: ICombatContext): ITickActionSystem {
    return new TickActionSystem(context)
  }
}
