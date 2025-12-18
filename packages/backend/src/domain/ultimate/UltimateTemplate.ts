import { I18nField } from '../../shared/models/I18nField'
import { TagTypeSet } from '../../shared/models/TagType'

export interface UltimateTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly tags: TagTypeSet
  readonly energyCost: number
  readonly effectIds: string[]
}
