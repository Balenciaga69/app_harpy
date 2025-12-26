import { BaseInstanceFields } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
/** 生物實例，代表由玩家或敵人召喚的臨時單位，包含來源者信息 */
export interface CreatureInstance extends BaseInstanceFields {
  summonerId: string
}
/** 生物樣板，定義生物的靜態屬性與持續時間 */
export interface CreatureTemplate {
  id: string
  name: I18nField
  desc: I18nField
  duration: number
}
