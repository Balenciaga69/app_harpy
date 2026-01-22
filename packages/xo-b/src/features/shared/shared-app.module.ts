import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/features/shared/shared-infra.module'

import { sharedAppProviders } from './providers/shared-app-providers'
@Module({
  imports: [SharedInfraModule],
  providers: [...sharedAppProviders],
  exports: [...sharedAppProviders],
})
export class SharedAppModule {}
