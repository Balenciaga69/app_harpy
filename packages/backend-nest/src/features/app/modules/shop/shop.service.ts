import { Injectable, BadRequestException, Optional } from '@nestjs/common'
import { ShopService } from 'src/from-game-core'
import { BuyItemDto } from './dto/BuyItemDto'
import { SellItemDto } from './dto/SellItemDto'
import { RefreshShopDto } from './dto/RefreshShopDto'
import { ContextManager } from 'src/infra/context/ContextManager'
interface GetShopItemsDto {
  runId: string
}
@Injectable()
export class ShopNestService {
  constructor(
    @Optional() private readonly shopService: ShopService,
    private readonly ctxManager: ContextManager
  ) {}
  getShopItems(dto: GetShopItemsDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const context = this.ctxManager.getContextByRunId(dto.runId)
    if (!context) throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    const shopContext = context.contexts.shopContext
    if (!shopContext) {
      throw new BadRequestException({ error: 'SHOP_CONTEXT_NOT_FOUND', message: '找不到商店上下文' })
    }
    return {
      success: true,
      data: shopContext,
    }
  }
  buyItem(dto: BuyItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const context = this.ctxManager.getContextByRunId(dto.runId)
    if (!context) throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    const result = this.shopService.buyItem(dto.itemId)
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '購買物品失敗',
      })
    }
    try {
      this.ctxManager.saveCtxByRunId(dto.runId)
    } catch (error) {
      throw new BadRequestException({
        error: 'CONTEXT_SAVE_FAILED',
        message: '無法保存運行上下文',
        details: error instanceof Error ? error.message : undefined,
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
    const context = this.ctxManager.getContextByRunId(dto.runId)
    if (!context) throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    const result = this.shopService.sellItem(dto.itemId)
    if (result.isFailure) {
      throw new BadRequestException({
        error: result.error,
        message: '賣出物品失敗',
      })
    }
    try {
      this.ctxManager.saveCtxByRunId(dto.runId)
    } catch (error) {
      throw new BadRequestException({
        error: 'CONTEXT_SAVE_FAILED',
        message: '無法保存運行上下文',
        details: error instanceof Error ? error.message : undefined,
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
    const context = this.ctxManager.getContextByRunId(dto.runId)
    if (!context) throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    const refreshResult = this.shopService.refreshShopItems()
    if (refreshResult.isFailure) {
      throw new BadRequestException({
        error: refreshResult.error,
        message: '刷新商店失敗',
      })
    }
    try {
      this.ctxManager.saveCtxByRunId(dto.runId)
    } catch (error) {
      throw new BadRequestException({
        error: 'CONTEXT_SAVE_FAILED',
        message: '無法保存運行上下文',
        details: error instanceof Error ? error.message : undefined,
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
