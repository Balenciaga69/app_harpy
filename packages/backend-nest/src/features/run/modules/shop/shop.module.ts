import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../application/shared-app.module'
import { ShopService } from 'src/from-game-core'
import { shopFeatureProviders } from './providers/shop-feature.providers'
import { ShopController } from './shop.controller'
import { ShopNestService } from './shop.service'
/**
 * 商店模組
 * 職責：管理商店相關功能（購買、賣出、刷新）
 *
 * 依賴層級：
 * ShopModule
 *   ├─ imports: SharedInfraModule (infra 層基礎)
 *   ├─ imports: SharedAppModule (app 層服務)
 *   └─ providers: shopFeatureProviders (此模組特定邏輯)
 */
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [ShopController],
  providers: [...shopFeatureProviders, ShopNestService],
  exports: [ShopNestService, ShopService],
})
export class ShopModule {}
