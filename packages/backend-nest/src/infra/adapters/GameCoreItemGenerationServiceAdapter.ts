import { Injectable } from '@nestjs/common'
import { IItemGenerationService, Result, ItemType, RelicEntity, CombatRewardType } from '../../from-game-core'

/**
 * 適配層：為 game-core 的 IItemGenerationService 提供實現
 * game-core 中的真實實現有複雜依賴，此處提供簡化版本供 NestJS DI 容器注入
 *
 * 注意：當前實現是 Stub，如需完整實現應在 game-core 內部完成
 */
@Injectable()
export class GameCoreItemGenerationServiceAdapter implements IItemGenerationService {
  generateRandomItemFromShop(): Result<RelicEntity> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateRandomItemFromReward(_rewardType: CombatRewardType): Result<RelicEntity> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  generateItemFromTemplate(_templateId: string, _itemType: ItemType): Result<RelicEntity> {
    // 此方法不在當前 backend-nest 架構中使用
    return Result.fail('Not implemented in backend adapter')
  }
}
