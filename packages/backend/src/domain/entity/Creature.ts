import { BaseInstanceFields } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { UnitStats } from '../stats/models/UnitStats'

export interface CreatureInstance extends BaseInstanceFields {
  summonerId: string
}

export interface CreatureTemplate {
  id: string
  name: I18nField
  desc: I18nField
  staticStats: UnitStats
  duration: number
}
