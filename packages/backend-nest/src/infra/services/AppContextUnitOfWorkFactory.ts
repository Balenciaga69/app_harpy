import { Injectable } from '@nestjs/common'
import { IContextUnitOfWork, ContextUnitOfWork, AppContextService, IAppContext } from '../../from-game-core'

/**
 * UnitOfWork 工廠
 * 職責：為給定的 IAppContext 創建 IContextUnitOfWork 實例
 * 邊界：純創建，不負責持久化，不包裝 commit()
 * 優點：業務邏輯可以在內存中安全地操作，上層決定是否持久化
 *
 * 與 ContextUnitOfWorkAdapter 的區別：
 * - ❌ Adapter：包裝 commit()，開啟異步，混淆職責
 * - ✅ Factory：純創建，同步返回，職責清晰
 */
@Injectable()
export class AppContextUnitOfWorkFactory {
  /**
   * 為給定的 IAppContext 創建 UnitOfWork
   *
   * @param appContext 當前應用上下文
   * @returns IContextUnitOfWork 實例
   *
   * @example
   * const unitOfWork = factory.createUnitOfWork(appContext)
   * // 業務邏輯修改狀態
   * unitOfWork.patchRunContext({ money: 100 })
   * // 提交內存修改
   * unitOfWork.commit()
   * // 上層決定是否持久化
   * repository.save(appContext)
   */
  createUnitOfWork(appContext: IAppContext): IContextUnitOfWork {
    // 步驟 1：創建 AppContextService
    // 此服務同時實現 IContextMutator 和 IContextSnapshotAccessor
    const contextService = new AppContextService(appContext)

    // 步驟 2：創建標準的 ContextUnitOfWork
    // 注意：不包裝 commit()，保持原有的同步語義
    // 異步和持久化由上層應用服務決定
    return new ContextUnitOfWork(contextService, contextService)
  }
}
