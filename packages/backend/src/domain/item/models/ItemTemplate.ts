import { I18nField } from '../../../shared/models/I18nField'

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export type EquipmentSlot = 'HEAD' | 'BODY' | 'LEGS' | 'WEAPON' | 'ACCESSORY'
export interface ItemTemplate {
  id: string
  name: I18nField
  desc: I18nField
  rarity: ItemRarity
  affixIds: string[]
}

export interface EquipmentTemplate extends ItemTemplate {
  slot: EquipmentSlot
}

export interface RelicTemplate extends ItemTemplate {
  stackLimit: number
  currentStacks: number
}
