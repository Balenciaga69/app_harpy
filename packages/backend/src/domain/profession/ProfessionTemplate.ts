import { I18nField } from '../../shared/models/I18nField'
/** 職業樣板，定義玩家職業的起始大絕招與遺物 */
export interface ProfessionTemplate {
  id: string
  name: I18nField
  desc: I18nField
  startUltimateIds: string[]
  startRelicIds: string[]
}
