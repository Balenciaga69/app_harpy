/**
 * Item System Module
 *
 * ÁÆ°Á?Ë£ùÂ??áÈÅ∫?©Á??∏Â?ÂÆöÁæ©?áË?ËßíÊ?ÂΩ±„Ä?
 * Á¥îË??ôÂ±§Ôºå‰?‰æùË≥¥ Combat Engine?ÅInventory ?ñ‰ªª‰ΩïÊ??∂„Ä?
 * Ë∑®Ë?Ë®Ä?ãÂ•ΩÔºåÂèØÂ∫èÂ??ñÁÇ∫ JSON??
 */
// === Equipment Slot ===
export type { EquipmentSlot } from '../interfaces/equipment-slot'
// === Definitions ===
export type { IItemDefinition, IEquipmentDefinition, IRelicDefinition, EquipmentRarity } from '../interfaces/definitions'
export type { IEquipmentInstance, IRelicInstance } from './definitions/item-instance'
// === Affixes ===
export type { IAffixDefinition, AffixTier, IAffixInstance } from '../interfaces/affixes'
// === Projections ===
export type { ICombatItemView, IInventoryItemView, IUIItemView } from '../interfaces/projections'
// === Factories ===
export { CombatItemFactory, EffectFactory } from '../app/factories'
export type { IEffectTemplateInfo } from '../app/factories'
// === Registries ===
export { ItemDefinitionRegistry, AffixDefinitionRegistry } from './registries'
// === Errors ===
export { ItemError } from './errors'
export type { ItemErrorCode } from './errors'

