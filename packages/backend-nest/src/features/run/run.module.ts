import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core/constants'
import { ContextInitializationInterceptor } from 'src/infra/interceptors/ContextInitializationInterceptor'
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

/**
 * RunModule
 *
 * 管理遊戲流程的主模組，透過子模組組織不同的功能特性
 *
 * 子模組結構：
 * - InitModule：遊戲初始化（選職業、選聖物、開始新遊戲）
 * - ShopModule：商店功能（購買、賣出、刷新）
 * - EquipmentModule：裝備管理
 * - RunModule（主）：遊戲進度和戰後獎勵
 *
 * 架構：
 * - ContextManager：統一的上下文管理服務
 * - 細粒度介面層：由 game-core 提供的界面實現
 * - 提供者組織：按功能特性分群（配置、內容生成、物品生成等）
 */
@Module({
  imports: [InitModule, ShopModule, EquipmentModule],
  providers: [
    // ============================================
    // 核心基礎設施
    // ============================================
    ContextManager,
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInitializationInterceptor,
    },

    // ============================================
    // 配置和存儲
    // ============================================
    ...configStoreProviders,

    // ============================================
    // 細粒度介面（由 game-core 定義）
    // ============================================
    ...fineGrainedInterfaceProviders,

    // ============================================
    // 內容生成鏈（敵人、物品、職業、最終技能）
    // ============================================
    ...contentGenerationProviders,

    // ============================================
    // 物品生成鏈（約束、修飾符、掉落、生成）
    // ============================================
    ...itemGenerationProviders,

    // ============================================
    // 上下文轉換和工作單元
    // ============================================
    ...contextConverterProviders,

    // ============================================
    // 功能特性提供者
    // ============================================
    ...runFeatureProviders,
    ...postCombatFeatureProviders,
  ],
})
export class RunModule {}
