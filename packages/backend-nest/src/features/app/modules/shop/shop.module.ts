import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { shopFeatureProviders } from './providers/shop.providers'
import { ShopController } from './shop.controller'
import { ShopNestService } from './shop.service'
/**
 * 商店模組
 * 職責：處理商店相關功能
 */
@Module({
  imports: [SharedInfraModule],
  controllers: [ShopController],
  providers: [ShopNestService, ...shopFeatureProviders],
  exports: [ShopNestService],
})
export class ShopModule {}
