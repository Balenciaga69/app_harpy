import { contentGenerationProviders } from './content-generation.providers'
import { contextConverterProviders } from './context-converter.providers'
import { itemGenerationProviders } from './item-generation.providers'

export const sharedAppProviders = [
  ...contentGenerationProviders,
  ...contextConverterProviders,
  ...itemGenerationProviders,
]
