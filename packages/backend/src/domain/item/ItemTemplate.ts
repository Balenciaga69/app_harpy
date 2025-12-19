import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type EquipmentSlot = 'HEAD' | 'BODY' | 'LEGS' | 'WEAPON' | 'ACCESSORY'
export interface ItemTemplate {
  readonly id: string
  readonly name: I18nField
  readonly desc: I18nField
  readonly rarity: ItemRarity
  readonly affixIds: string[]
  readonly tags: TagType[]
}

export interface EquipmentTemplate extends ItemTemplate {
  readonly slot: EquipmentSlot
}

export interface RelicTemplate extends ItemTemplate {
  readonly stackLimit: number
  currentStacks: number
}
