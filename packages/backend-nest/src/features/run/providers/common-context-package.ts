import { configStoreProviders } from './config-store.providers'
import { contentGenerationProviders } from './content-generation.providers'
import { contextConverterProviders } from './context-converter.providers'
import { fineGrainedInterfaceProviders } from './fine-grained-interface.providers'
import { itemGenerationProviders } from './item-generation.providers'

export const sharedProviders = [
  ...configStoreProviders,
  ...fineGrainedInterfaceProviders,
  ...contextConverterProviders,
  ...contentGenerationProviders,
  ...itemGenerationProviders,
]
