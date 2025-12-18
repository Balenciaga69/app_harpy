import { I18nField } from '../../shared/models/I18nField'
import { UltimateEffect } from './UltimateEffect'

export interface Ultimate {
  id: string
  name: I18nField
  desc: I18nField
  energyCost: number
  effectList: UltimateEffect[]
}
