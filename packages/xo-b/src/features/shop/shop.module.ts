import { Module } from '@nestjs/common'
import { SharedAppModule } from 'src/features/shared/shared-app.module'
import { SharedInfraModule } from 'src/features/shared/shared-infra.module'
import { shopFeatureProviders } from './shop.providers'
import { ShopNestService } from './shop.service'
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [],
  providers: [ShopNestService, ...shopFeatureProviders],
  exports: [ShopNestService],
})
export class ShopModule {}
