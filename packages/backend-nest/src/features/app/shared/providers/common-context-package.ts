import { contentGenerationProviders } from './content-generation.providers'
import { contextConverterProviders } from './context-converter.providers'
import { itemGenerationProviders } from './item-generation.providers'
/**
 * 應用層共享提供者包
 * 職責：聚合所有應用層的核心服務
 *
 * 包含：
 * - contentGenerationProviders: 實體和聚合體生成
 * - contextConverterProviders: 上下文與領域模型轉換
 * - itemGenerationProviders: 物品生成流程
 *
 * 層級：app（應用層）
 * 用途：由 SharedAppModule 導出，供所有業務功能模組使用
 */
export const sharedAppProviders = [
  ...contentGenerationProviders,
  ...contextConverterProviders,
  ...itemGenerationProviders,
]
