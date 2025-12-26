import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly effectIds: string[]
}
