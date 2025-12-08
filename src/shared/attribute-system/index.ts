/**
 * Shared Attribute System
 *
 * 共享的屬性計算系統，可被戰鬥內外使用。
 *
 * 設計原則：
 * - 無外部依賴（除了 @/domain/attribute 基礎類型）
 * - 純邏輯實現，易於跨語言移植
 * - 支援優先級排序與加法/乘法分離計算
 */

// 核心類別
export { AttributeManager } from './AttributeManager'
export { AttributeCalculator } from './AttributeCalculator'

// 類型定義
export type { IAttributeCalculator } from './models/attribute-calculator'
export type { AttributeModifier, AttributeModifierEx, ModifierPriorityType } from './models/attribute-modifier'
export { ModifierPriority } from './models/attribute-modifier'

// 重新導出 domain 層基礎類型（便於使用）
export type { AttributeType, BaseAttributeValues } from '@/domain/attribute'
export { createDefaultAttributes, AttributeDefaults, AttributeLimits } from '@/domain/attribute'
