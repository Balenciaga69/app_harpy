import { Injectable } from '@nestjs/common'
import { IShopContextHandler, Result, Character, CharacterRecord, Shop, Stash } from '../../from-game-core'

/**
 * 適配層：為 game-core 的 IShopContextHandler 提供實現
 * game-core 中的真實實現依賴複雜的 Context 系統，此處提供簡化版本供 NestJS DI 容器注入
 *
 * 注意：當前實現是 Stub，如需完整實現應在 game-core 內部完成
 */
@Injectable()
export class GameCoreShopContextHandlerAdapter implements IShopContextHandler {
  getDifficulty(): number {
    // 此方法不在當前 backend-nest 架構中使用
    throw new Error('Not implemented in backend adapter')
  }

  loadShopDomainContexts(): { shop: Shop; character: Character; stash: Stash } {
    // 此方法不在當前 backend-nest 架構中使用
    throw new Error('Not implemented in backend adapter')
  }

  validateRunStatus(): Result<void, string> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commitBuyTransaction(_updates: { characterRecord?: CharacterRecord; shop?: Shop; stash?: Stash }): Result<void> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commitSellTransaction(_updates: { characterRecord?: CharacterRecord; stash?: Stash }): Result<void> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commitGenerateShopItemsTransaction(_updates: { shop: Shop }): Result<void> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }
}
