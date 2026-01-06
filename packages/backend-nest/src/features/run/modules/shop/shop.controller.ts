import { Controller, Post, Body } from '@nestjs/common'
import { ApiOperation, ApiBody } from '@nestjs/swagger'
import { BuyItemDto } from '../../dto/BuyItemDto'
import { SellItemDto } from '../../dto/SellItemDto'
import { RefreshShopDto } from '../../dto/RefreshShopDto'
import { ShopNestService } from './shop.service'

/**
 * 商店控制器
 * 職責：處理商店相關的 HTTP 請求
 */
@Controller('api/run')
export class ShopController {
  constructor(private readonly shopService: ShopNestService) {}

  /**
   * POST /api/run/shop/buy - 在商店購買物品
   */
  @Post('shop/buy')
  @ApiOperation({ summary: '購買物品' })
  @ApiBody({
    schema: {
      example: {
        runId: 'run_abc123',
        itemId: 'relic_warrior_resolute_heart',
      },
    },
  })
  buyItem(@Body() dto: BuyItemDto) {
    return this.shopService.buyItem(dto)
  }

  /**
   * POST /api/run/shop/sell - 賣出物品
   */
  @Post('shop/sell')
  @ApiOperation({ summary: '賣出物品' })
  @ApiBody({
    schema: {
      example: {
        runId: 'run_abc123',
        itemId: 'relic_warrior_resolute_heart',
      },
    },
  })
  sellItem(@Body() dto: SellItemDto) {
    return this.shopService.sellItem(dto)
  }

  /**
   * POST /api/run/shop/refresh - 刷新商店物品
   */
  @Post('shop/refresh')
  @ApiOperation({ summary: '刷新商店' })
  @ApiBody({
    schema: {
      example: {
        runId: 'run_abc123',
      },
    },
  })
  refreshShop(@Body() dto: RefreshShopDto) {
    return this.shopService.refreshShop(dto)
  }
}
