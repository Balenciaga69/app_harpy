import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'

import { sharedAppProviders } from './providers/common-context-package'
@Module({
  imports: [SharedInfraModule],
  providers: [...sharedAppProviders],
  exports: [...sharedAppProviders],
})
export class SharedAppModule {}
