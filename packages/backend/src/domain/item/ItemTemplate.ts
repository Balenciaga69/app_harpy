import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'

export type ItemRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export interface ItemTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly rarity: ItemRarity
  readonly affixIds: string[]
  readonly tags: TagType[]
  readonly loadCost: number
}

export interface RelicTemplate extends ItemTemplate {
  readonly stackLimit: number
}
