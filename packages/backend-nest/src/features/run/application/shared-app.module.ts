import { Module } from '@nestjs/common'
import { SharedInfraModule } from 'src/infra/shared-infra.module'
import { sharedAppProviders } from './providers/common-context-package'
/**
 * 共享應用層模組
 * 職責：提供應用層（app）的核心業務服務
 *
 * 包含：
 * - 實體服務: Affix, Ultimate, Item, Profession, Character
 * - 上下文轉換: ContextToDomainConverter, ContextUnitOfWork
 * - 物品生成: 完整生成鏈
 *
 * 層級：app（應用層）
 * 原因：
 * - 這些是業務邏輯層的服務
 * - 由應用服務（Application Service）協調使用
 * - 依賴 infra 層提供的介面和配置
 *
 * 依賴流向：
 * SharedAppModule → SharedInfraModule
 * 功能模組 → SharedAppModule + SharedInfraModule
 */
@Module({
  imports: [SharedInfraModule],
  providers: [...sharedAppProviders],
  exports: [...sharedAppProviders],
})
export class SharedAppModule {}
