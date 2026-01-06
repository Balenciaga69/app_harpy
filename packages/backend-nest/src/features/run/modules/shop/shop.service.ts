import { Injectable, BadRequestException, Optional } from '@nestjs/common'
import { ShopService } from 'src/from-game-core'
import { BuyItemDto } from '../../dto/BuyItemDto'
import { SellItemDto } from '../../dto/SellItemDto'
import { RefreshShopDto } from '../../dto/RefreshShopDto'

/**
 * 商店服務
 * 職責：處理商店相關的業務邏輯（購買、賣出、刷新）
 */
@Injectable()
export class ShopNestService {
  constructor(@Optional() private readonly shopService: ShopService) {}

  /**
   * 購買物品
   */
  buyItem(dto: BuyItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const result = this.shopService.buyItem(dto.itemId)
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '購買物品失敗',
      })
    }
    return {
      success: true,
      message: '購買成功',
      data: {
        runId: dto.runId,
        itemId: dto.itemId,
      },
    }
  }

  /**
   * 賣出物品
   */
  sellItem(dto: SellItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const result = this.shopService.sellItem(dto.itemId)
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '賣出物品失敗',
      })
    }
    return {
      success: true,
      message: '賣出成功',
      data: {
        runId: dto.runId,
        itemId: dto.itemId,
      },
    }
  }

  /**
   * 刷新商店物品
   */
  refreshShop(dto: RefreshShopDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const result = this.shopService.refreshShopItems()
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '刷新商店失敗',
      })
    }
    return {
      success: true,
      message: '刷新成功',
      data: {
        runId: dto.runId,
      },
    }
  }
}
