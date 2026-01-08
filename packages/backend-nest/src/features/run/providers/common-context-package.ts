import { contentGenerationProviders } from '../application/providers/content-generation.providers'
import { contextConverterProviders } from '../application/providers/context-converter.providers'
import { fineGrainedInterfaceProviders } from 'src/infra/providers/fine-grained-interface.providers'
import { itemGenerationProviders } from '../application/providers/item-generation.providers'
/**
 * @deprecated
 * 請使用 SharedAppModule 或 SharedInfraModule 代替
 *
 * 舊的共享提供者包（保留以相容性）
 * 該檔案現在只是重新導出已遷移到其他層級的 providers
 */
export const sharedProviders = [
  ...fineGrainedInterfaceProviders,
  ...contentGenerationProviders,
  ...contextConverterProviders,
  ...itemGenerationProviders,
]
