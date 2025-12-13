import type { ICombatContext } from '../interfaces/context/ICombatContext'
import type { ITickActionSystem } from '../interfaces/coordination/ITickActionSystem'
import type { ICoordinationFactory } from '../interfaces/factories/ICoordinationFactory'
import { TickActionSystem } from '../app/coordination/TickActionSystem'
/**
 * CoordinationFactory
 *
 * 協調系統工廠，實作 ICoordinationFactory 介面
 * 創建協調層的組件
 */
export class CoordinationFactory implements ICoordinationFactory {
  /** 單例實例 */
  private static instance: CoordinationFactory | null = null
  /** 獲取單例實例 */
  static getInstance(): ICoordinationFactory {
    if (!this.instance) {
      this.instance = new CoordinationFactory()
    }
    return this.instance
  }
  /** 創建 TickActionSystem 實例 */
  createTickActionSystem(context: ICombatContext): ITickActionSystem {
    return new TickActionSystem(context)
  }
  /** @deprecated 請使用 getInstance() */
  static createTickActionSystem(context: ICombatContext): ITickActionSystem {
    return CoordinationFactory.getInstance().createTickActionSystem(context)
  }
}
