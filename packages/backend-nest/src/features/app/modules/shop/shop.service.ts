import { Injectable, BadRequestException, Optional } from '@nestjs/common'
import { ShopService } from 'src/from-game-core'
import { BuyItemDto } from './dto/BuyItemDto'
import { SellItemDto } from './dto/SellItemDto'
import { RefreshShopDto } from './dto/RefreshShopDto'
import { ContextManager } from 'src/infra/context/ContextManager'

@Injectable()
export class ShopNestService {
  constructor(
    @Optional() private readonly shopService: ShopService,
    private readonly ctxManager: ContextManager
  ) {}

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

  refreshShop(dto: RefreshShopDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const xx = this.ctxManager.getContextByRunId(dto.runId)
    console.info('xZx xx', xx)
    const result = this.shopService.refreshShopItems()
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '刷新商店失敗',
      })
    }
    const x = this.ctxManager.getContextByRunId(dto.runId)
    const y = x?.contexts.shopContext
    const z = x?.contexts.characterContext.gold
    console.info('xZx z', z)
    console.info('xZx y', y?.items)
    return {
      success: true,
      message: '刷新成功',
      data: {
        runId: dto.runId,
      },
    }
  }
}
