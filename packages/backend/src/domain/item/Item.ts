import { I18nField } from '../../shared/models/I18nField'

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
export interface Item {
  id: string
  name: I18nField
  desc: I18nField
  rarity: ItemRarity
  affixIds: string[]
}

export interface Equipment extends Item {
  slot: 'HEAD' | 'BODY' | 'LEGS' | 'WEAPON' | 'ACCESSORY'
}

export interface Relic extends Item {
  stackLimit: number
  currentStacks: number
}
