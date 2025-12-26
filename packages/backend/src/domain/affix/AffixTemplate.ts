import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
/** 詞綴樣板，定義詞綴的靜態屬性與綁定的效果集合 */
export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: TagType[]
  readonly effectIds: string[]
}
