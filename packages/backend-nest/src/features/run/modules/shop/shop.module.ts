import { Module } from '@nestjs/common'
import { ShopService } from 'src/from-game-core'
import { shopFeatureProviders } from '../../providers/shop-feature.providers'
import { contentGenerationProviders } from '../../providers/content-generation.providers'
import { itemGenerationProviders } from '../../providers/item-generation.providers'
import { contextConverterProviders } from '../../providers/context-converter.providers'
import { fineGrainedInterfaceProviders } from '../../providers/fine-grained-interface.providers'
import { configStoreProviders } from '../../providers/config-store.providers'
import { ShopController } from './shop.controller'
import { ShopNestService } from './shop.service'
/**
 * 商店模組
 * 職責：管理商店相關功能（購買、賣出、刷新）
 */
@Module({
  controllers: [ShopController],
  providers: [
    ...configStoreProviders,
    ...fineGrainedInterfaceProviders,
    ...contentGenerationProviders,
    ...itemGenerationProviders,
    ...contextConverterProviders,
    ...shopFeatureProviders,
    ShopNestService,
  ],
  exports: [ShopNestService, ShopService],
})
export class ShopModule {}
