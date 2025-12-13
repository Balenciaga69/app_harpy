import type { ICombatContext } from '../context/ICombatContext'
import type { ITickActionSystem } from '../coordination/ITickActionSystem'

/**
 * ICoordinationFactory
 *
 * 協調系統工廠介面
 * 負責創建戰鬥協調相關的組件
 */
export interface ICoordinationFactory {
  /** 創建 Tick 行動系統 */
  createTickActionSystem(context: ICombatContext): ITickActionSystem
}
