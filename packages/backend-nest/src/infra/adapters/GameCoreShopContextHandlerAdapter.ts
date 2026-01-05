import { Injectable } from '@nestjs/common'
import {
  IShopContextHandler,
  Result,
  Character,
  CharacterRecord,
  Shop,
  Stash,
  AppContextService,
  ContextUnitOfWork,
} from '../../from-game-core'
import { ContextStorage } from '../context/ContextStorage'

/**
 * 商店上下文處理適配層
 * 職責：為 game-core 的 IShopContextHandler 提供完整實現
 * 根據當前 IAppContext 初始化所有必需的 game-core 依賴
 */
@Injectable()
export class GameCoreShopContextHandlerAdapter implements IShopContextHandler {
  getDifficulty(): number {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)
    return appContextService.getCurrentAtCreatedInfo().difficulty
  }

  loadShopDomainContexts(): { shop: Shop; character: Character; stash: Stash } {
    // TODO: 實現上下文到領域模型的轉換
    // 需要使用 AppContextService 提供的方法
    throw new Error('TODO: Implement context to domain model conversion')
  }

  validateRunStatus(): Result<void, string> {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)
    const runContext = appContextService.getRunContext()

    if (runContext.status === 'IDLE') {
      return Result.success(undefined)
    }

    return Result.fail(`Run status is not IDLE, current status: ${runContext.status}`)
  }

  commitBuyTransaction(updates: { characterRecord?: CharacterRecord; shop?: Shop; stash?: Stash }): Result<void> {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)
    const unitOfWork = new ContextUnitOfWork(appContextService, appContextService)

    if (updates.characterRecord) {
      unitOfWork.patchCharacterContext(updates.characterRecord)
    }

    if (updates.stash) {
      unitOfWork.patchStashContext({
        items: updates.stash.listItems().map((i) => i.record),
      })
    }

    if (updates.shop) {
      unitOfWork.patchShopContext({
        items: updates.shop.items.map((shopAgg) => shopAgg.record),
      })
    }

    unitOfWork.commit()
    return Result.success(undefined)
  }

  commitSellTransaction(updates: { characterRecord?: CharacterRecord; stash?: Stash }): Result<void> {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)
    const unitOfWork = new ContextUnitOfWork(appContextService, appContextService)

    if (updates.characterRecord) {
      unitOfWork.patchCharacterContext(updates.characterRecord)
    }

    if (updates.stash) {
      unitOfWork.patchStashContext({
        items: updates.stash.listItems().map((i) => i.record),
      })
    }

    unitOfWork.commit()
    return Result.success(undefined)
  }

  commitGenerateShopItemsTransaction(updates: { shop: Shop }): Result<void> {
    const appContext = ContextStorage.getContext()
    const appContextService = new AppContextService(appContext)
    const unitOfWork = new ContextUnitOfWork(appContextService, appContextService)

    unitOfWork.patchShopContext({
      items: updates.shop.items.map((shopAgg) => shopAgg.record),
    })

    unitOfWork.commit()
    return Result.success(undefined)
  }
}
