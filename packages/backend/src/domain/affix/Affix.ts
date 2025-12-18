import { I18nField } from '../../shared/models/I18nField'

export interface Affix {
  readonly id: string
  readonly desc: I18nField
  readonly effectIds: string[]
}
