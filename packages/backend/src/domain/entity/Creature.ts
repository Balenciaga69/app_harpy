import { I18nField } from '../../shared/models/I18nField'
/** 生物實例，代表由玩家或敵人召喚的臨時單位，包含來源者資訊 */
export class CreatureAggregate {
  readonly summonerId: string
  readonly id: string
  readonly template: CreatureTemplate
  constructor(summonerId: string, id: string, template: CreatureTemplate) {
    this.summonerId = summonerId
    this.id = id
    this.template = template
  }
}
/** 生物樣板，定義生物的靜態屬性與持續時間 */
export interface CreatureTemplate {
  id: string
  name: I18nField
  desc: I18nField
  duration: number
}
