import { Module } from '@nestjs/common'
import { sharedAppProviders } from './providers/common-context-package'
/**
 * 應用層共享模組
 * 職責：提供應用層共享的服務和提供者
 */
@Module({
  providers: [...sharedAppProviders],
  exports: [...sharedAppProviders],
})
export class SharedAppModule {}
