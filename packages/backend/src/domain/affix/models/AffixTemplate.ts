import { I18nField } from '../../../shared/models/I18nField'

export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly effectIds: string[]
}
