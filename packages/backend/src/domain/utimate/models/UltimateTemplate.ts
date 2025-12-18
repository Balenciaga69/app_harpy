import { I18nField } from '../../../shared/models/I18nField'

export interface UltimateTemplate {
  id: string
  name: I18nField
  desc: I18nField
  energyCost: number
  effectIds: string[]
}
