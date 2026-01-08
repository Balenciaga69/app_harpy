import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { sharedAppProviders } from './providers/common-context-package'
/**
 * 應用層共享模組
 * 職責：提供應用層共享的服務和提供者
 *
 * ⚠️ 重要：必須 import SharedInfraModule
 * 因為應用層的 providers 需要基礎設施層提供的依賴
 * 例如 UltimateEntityService 需要 IConfigStoreAccessor
 */
@Module({
  imports: [SharedInfraModule],
  providers: [...sharedAppProviders],
  exports: [...sharedAppProviders],
})
export class SharedAppModule {}
