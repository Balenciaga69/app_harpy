import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { SharedAppModule } from '../../shared/shared-app.module'
import { shopFeatureProviders } from './providers/shop.providers'
import { ShopController } from './shop.controller'
import { ShopNestService } from './shop.service'
@Module({
  imports: [SharedInfraModule, SharedAppModule],
  controllers: [ShopController],
  providers: [ShopNestService, ...shopFeatureProviders],
  exports: [ShopNestService],
})
export class ShopModule {}
