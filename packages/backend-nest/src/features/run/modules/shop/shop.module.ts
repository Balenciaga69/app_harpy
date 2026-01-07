import { Module } from '@nestjs/common'
import { ShopService } from 'src/from-game-core'
import { sharedProviders } from '../../providers/common-context-package'
import { shopFeatureProviders } from '../../providers/shop-feature.providers'
import { ShopController } from './shop.controller'
import { ShopNestService } from './shop.service'
/**
 * 商店模組
 * 職責：管理商店相關功能（購買、賣出、刷新）
 */
@Module({
  controllers: [ShopController],
  providers: [...sharedProviders, ...shopFeatureProviders, ShopNestService],
  exports: [ShopNestService, ShopService],
})
export class ShopModule {}
