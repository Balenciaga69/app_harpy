import { BadRequestException, Injectable, Optional } from '@nestjs/common'
import { ContextManager } from 'src/features/shared/context/context-manager'
import { ShopService } from 'src/features/shared/from-game-core'
import { ResultToExceptionMapper } from 'src/features/shared/mappers/result-to-exception-mapper'
import { BuyItemDto } from './model/buy-item.dto'
import { RefreshShopDto } from './model/refresh-shop.dto'
import { SellItemDto } from './model/sell-item.dto'
interface GetShopItemsDto {
  runId: string
}
@Injectable()
export class ShopNestService {
  constructor(
    @Optional() private readonly shopService: ShopService,
    private readonly ctxManager: ContextManager
  ) {}
  async getShopItems(dto: GetShopItemsDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const context = await this.ctxManager.getContextByRunId(dto.runId)
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
  async buyItem(dto: BuyItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const contextBefore = await this.ctxManager.getContextByRunId(dto.runId)
    if (!contextBefore) {
      throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    }
    const result = this.shopService.buyItem(dto.itemId)
    ResultToExceptionMapper.throwIfFailure(result)
    return {
      success: true,
      message: '購買成功',
      data: {
        runId: dto.runId,
        itemId: dto.itemId,
      },
    }
  }
  async sellItem(dto: SellItemDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const contextBefore = await this.ctxManager.getContextByRunId(dto.runId)
    if (!contextBefore) {
      throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    }
    const result = this.shopService.sellItem(dto.itemId)
    ResultToExceptionMapper.throwIfFailure(result)
    return {
      success: true,
      message: '賣出成功',
      data: {
        runId: dto.runId,
        itemId: dto.itemId,
      },
    }
  }
  async refreshShop(dto: RefreshShopDto) {
    if (!this.shopService) {
      throw new BadRequestException({ error: 'CONTEXT_NOT_READY', message: '尚未進入遊戲或上下文未就緒' })
    }
    const contextBefore = await this.ctxManager.getContextByRunId(dto.runId)
    if (!contextBefore) {
      throw new BadRequestException({ error: 'RUN_NOT_FOUND', message: 'Run not found' })
    }
    const refreshResult = this.shopService.refreshShopItems()
    ResultToExceptionMapper.throwIfFailure(refreshResult)
    return {
      success: true,
      message: '刷新成功',
      data: {
        runId: dto.runId,
      },
    }
  }
}
