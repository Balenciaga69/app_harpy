import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { ContextInitializationInterceptor } from 'src/infra/interceptors/context-initialization.interceptor'
import { BuyItemDto } from './dto/buy-item.dto'
import { RefreshShopDto } from './dto/refresh-shop.dto'
import { SellItemDto } from './dto/sell-item.dto'
import { ShopNestService } from './shop.service'
@UseInterceptors(ContextInitializationInterceptor)
@Controller('api/run')
export class ShopController {
  constructor(private readonly shopService: ShopNestService) {}
  @Get('shop/items')
  getShopItems(@Query('runId') runId: string) {
    return this.shopService.getShopItems({ runId })
  }
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
