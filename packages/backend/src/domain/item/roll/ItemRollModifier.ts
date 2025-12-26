import { TagType } from '../../../shared/models/TagType'
import { ItemRarity } from '../ItemTemplate'
// 物品生成修飾符介面(modifier)
export type ItemRollModifier = ItemRollRarityModifier | ItemRollTagModifier | ItemRollIdModifier
// 物品稀有度
export type ItemRollRarityModifier = { type: 'RARITY'; rarity: ItemRarity } & BaseRollModifier
// 物品標籤
export type ItemRollTagModifier = { type: 'TAG'; tag: TagType } & BaseRollModifier
// 單一物品
export type ItemRollIdModifier = { type: 'ID'; templateId: string } & BaseRollModifier
// 倍率乘數 與 可以持續多少關卡或永久
type BaseRollModifier = { multiplier: number; durationStages: number }
