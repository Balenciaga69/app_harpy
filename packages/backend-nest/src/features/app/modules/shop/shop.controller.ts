import { Controller, Post, Body, UseInterceptors } from '@nestjs/common'
import { ApiOperation, ApiBody } from '@nestjs/swagger'
import { BuyItemDto } from './dto/BuyItemDto'
import { SellItemDto } from './dto/SellItemDto'
import { RefreshShopDto } from './dto/RefreshShopDto'
import { ShopNestService } from './shop.service'
import { ContextInitializationInterceptor } from 'src/infra/interceptors/ContextInitializationInterceptor'
@UseInterceptors(ContextInitializationInterceptor)
@Controller('api/run')
export class ShopController {
  constructor(private readonly shopService: ShopNestService) {}
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
  async buyItem(@Body() dto: BuyItemDto) {
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
  async sellItem(@Body() dto: SellItemDto) {
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
  async refreshShop(@Body() dto: RefreshShopDto) {
    return this.shopService.refreshShop(dto)
  }
}
