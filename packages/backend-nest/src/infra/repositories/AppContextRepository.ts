import { Injectable } from '@nestjs/common'
import { IAppContext } from '../../from-game-core'

/**
 * 應用上下文倉庫
 * 職責：保存和檢索完整的 IAppContext（聚合根）
 * 邊界：原子性操作，不暴露細粒度的字段更新
 * 優點：統一的接口，易於遷移到 SQL 數據庫
 */
@Injectable()
export class AppContextRepository {
  private store = new Map<string, IAppContext>()

  /**
   * 保存完整的應用上下文
   * @param appContext 完整的應用上下文，必須包含 runId
   * @throws Error 如果 appContext 不包含有效的 runId
   */
  save(appContext: IAppContext): void {
    const runId = appContext.contexts.runContext.runId
    if (!runId) {
      throw new Error('AppContext must have a valid runId')
    }
    // 深拷貝，防止調用者修改存儲的引用
    this.store.set(runId, this.deepCopy(appContext))
  }

  /**
   * 按 runId 檢索完整的應用上下文
   * @param runId 運行 ID
   * @returns 應用上下文，或 null 如果不存在
   */
  getByRunId(runId: string): IAppContext | null {
    if (!runId) {
      return null
    }
    const ctx = this.store.get(runId)
    return ctx ? this.deepCopy(ctx) : null
  }

  /**
   * 檢查指定 runId 是否存在
   * @param runId 運行 ID
   */
  exists(runId: string): boolean {
    return this.store.has(runId)
  }

  /**
   * 刪除指定 runId 的所有數據
   * @param runId 運行 ID
   */
  delete(runId: string): void {
    this.store.delete(runId)
  }

  /**
   * 深拷貝對象，防止引用共享
   */
  private deepCopy(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }
}
