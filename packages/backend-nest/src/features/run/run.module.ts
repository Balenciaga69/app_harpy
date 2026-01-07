import { Module } from '@nestjs/common'
import { ContextManager } from 'src/infra/context/ContextManager'
// 子模組導入
import { InitModule } from './modules/init/init.module'
import { ShopModule } from './modules/shop/shop.module'
import { EquipmentModule } from './modules/equipment/equipment.module'
// Provider 導入
import { configStoreProviders } from './providers/config-store.providers'
import { fineGrainedInterfaceProviders } from './providers/fine-grained-interface.providers'
import { contentGenerationProviders } from './providers/content-generation.providers'
import { itemGenerationProviders } from './providers/item-generation.providers'
import { contextConverterProviders } from './providers/context-converter.providers'
import { runFeatureProviders } from './providers/run-feature.providers'
import { postCombatFeatureProviders } from './providers/post-combat-feature.providers'
@Module({
  imports: [InitModule, ShopModule, EquipmentModule],
  providers: [
    ContextManager,
    ...configStoreProviders,
    ...fineGrainedInterfaceProviders,
    ...contentGenerationProviders,
    ...itemGenerationProviders,
    ...contextConverterProviders,
    ...runFeatureProviders,
    ...postCombatFeatureProviders,
  ],
})
export class RunModule {}
