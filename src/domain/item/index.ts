/**
 * Item System Module
 *
 * 管理裝備與遺物的核心定義與視角投影。
 * 純資料層，不依賴 Combat Engine、Inventory 或任何框架。
 * 跨語言友好，可序列化為 JSON。
 */
// === Definitions ===
export type {
  IItemDefinition,
  IEquipmentDefinition,
  IRelicDefinition,
  EquipmentSlot,
  EquipmentRarity,
} from './definitions'
// === Affixes ===
export type { IAffixDefinition, AffixTier, IAffixInstance } from './affixes'
export { AffixRoller } from './affixes'
export type { IRng } from './affixes/AffixRoller'
// === Projections ===
export type { ICombatItemView, IInventoryItemView, IUIItemView } from './projections'
// === Factories ===
export { CombatItemFactory, EffectFactory } from './factories'
export type { EffectBuilder } from './factories'
// === Registries ===
export { ItemDefinitionRegistry, AffixDefinitionRegistry } from './registries'
