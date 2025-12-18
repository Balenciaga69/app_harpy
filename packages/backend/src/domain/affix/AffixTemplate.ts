import { I18nField } from '../../shared/models/I18nField'
import { TagTypeSet } from '../../shared/models/TagType'

export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: TagTypeSet
  readonly effectIds: string[]
}
