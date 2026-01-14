import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { ContextInitializationInterceptor } from 'src/features/shared/interceptors/context-initialization.interceptor'
import { BuyItemDto } from './model/buy-item.dto'
import { RefreshShopDto } from './model/refresh-shop.dto'
import { SellItemDto } from './model/sell-item.dto'
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
