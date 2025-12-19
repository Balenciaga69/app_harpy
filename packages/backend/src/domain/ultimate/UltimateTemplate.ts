import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UltimateEffect } from './UltimateEffect'

export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly energyCost: number
  readonly effect: UltimateEffect[]
}
