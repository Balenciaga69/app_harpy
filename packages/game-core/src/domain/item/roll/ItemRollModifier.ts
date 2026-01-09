import { TagType } from '../../../shared/models/TagType'
import { ItemRarity } from '../Item'
export type ItemRollModifierType = 'RARITY' | 'TAG' | 'ID'

export type ItemRollModifier = ItemRollRarityModifier | ItemRollTagModifier | ItemRollIdModifier

export type ItemRollRarityModifier = { type: 'RARITY'; rarity: ItemRarity } & BaseRollModifier

export type ItemRollTagModifier = { type: 'TAG'; tag: TagType } & BaseRollModifier

export type ItemRollIdModifier = { type: 'ID'; templateId: string } & BaseRollModifier

type BaseRollModifier = { multiplier: number; durationStages: number }
