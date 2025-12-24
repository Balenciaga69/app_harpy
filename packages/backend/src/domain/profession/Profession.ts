import { I18nField } from '../../shared/models/I18nField'

export interface ProfessionTemplate {
  id: string
  name: I18nField
  desc: I18nField
  startUltimateIds: string[]
  startRelicIds: string[]
}
