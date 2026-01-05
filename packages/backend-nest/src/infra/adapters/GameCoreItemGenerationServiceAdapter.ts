import { Injectable } from '@nestjs/common'
import {
  IItemGenerationService,
  Result,
  ItemType,
  RelicEntity,
  CombatRewardType,
  AppContextService,
} from '../../from-game-core'
import { ContextStorage } from '../context/ContextStorage'

/**
 * 物品生成服務適配層
 * 職責：為 game-core 的 IItemGenerationService 提供完整實現
 * 根據當前 IAppContext 初始化所有必需的 game-core 依賴
 */
@Injectable()
export class GameCoreItemGenerationServiceAdapter implements IItemGenerationService {
  generateRandomItemFromShop(): Result<RelicEntity> {
    try {
      const appContext = ContextStorage.getContext()
      // 應用上下文服務會在完整實現時使用
      new AppContextService(appContext)
      // TODO: 實現根據商店來源生成隨機物品的邏輯
      // 需要使用 appContextService 和 configStore
      throw new Error('TODO: Implement generateRandomItemFromShop')
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  generateRandomItemFromReward(_rewardType: CombatRewardType): Result<RelicEntity> {
    try {
      const appContext = ContextStorage.getContext()
      // 應用上下文服務會在完整實現時使用
      new AppContextService(appContext)
      // TODO: 實現根據獎勵類型生成隨機物品的邏輯
      // 需要使用 appContextService、configStore 和 rewardType
      throw new Error('TODO: Implement generateRandomItemFromReward')
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  generateItemFromTemplate(_templateId: string, _itemType: ItemType): Result<RelicEntity> {
    try {
      const appContext = ContextStorage.getContext()
      // 應用上下文服務會在完整實現時使用
      new AppContextService(appContext)
      // TODO: 實現根據指定樣板生成物品的邏輯
      // 需要使用 appContextService、configStore、templateId 和 itemType
      throw new Error('TODO: Implement generateItemFromTemplate')
    } catch (error) {
      return Result.fail(error instanceof Error ? error.message : 'Unknown error')
    }
  }
}
