import { I18nField } from '../../shared/I18nField'
import { AffixEffect } from './effect/AffixEffect'

export interface Affix {
  id: string
  desc: I18nField
  effects: AffixEffect[]
}
