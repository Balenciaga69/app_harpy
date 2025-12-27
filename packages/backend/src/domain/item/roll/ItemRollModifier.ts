import { TagType } from '../../../shared/models/TagType'
import { ItemRarity } from '../Item'
/** 物品生成修飾符，用於臨時調整生成權重與持續期限 */
export type ItemRollModifier = ItemRollRarityModifier | ItemRollTagModifier | ItemRollIdModifier
/** 稀有度修飾符，提升特定稀有度物品的出現機率 */
export type ItemRollRarityModifier = { type: 'RARITY'; rarity: ItemRarity } & BaseRollModifier
/** 標籤修飾符，提升具有特定標籤物品的出現機率 */
export type ItemRollTagModifier = { type: 'TAG'; tag: TagType } & BaseRollModifier
/** ID 修飾符，提升特定物品的出現機率 */
export type ItemRollIdModifier = { type: 'ID'; templateId: string } & BaseRollModifier
/** 生成修飾符的基礎配置，定義倍率與持續期限 */
type BaseRollModifier = { multiplier: number; durationStages: number }
