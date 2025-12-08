/**
 * Combat Domain - Attribute Module
 *
 * 戰鬥領域的屬性系統。
 * 核心類型定義來自 domain/attribute，此處僅處理戰鬥計算邏輯。
 */
// 重新導出共享定義層
export { createDefaultAttributes } from '@/domain/attribute'
export type { AttributeType, BaseAttributeValues } from '@/domain/attribute'
// 導出戰鬥專用的計算邏輯
export { AttributeCalculator } from './AttributeCalculator.ts'
export { AttributeManager } from './AttributeManager.ts'
export type { IAttributeCalculator } from './models/attribute-calculator.ts'
export { ModifierPriority } from './models/attribute-modifier.ts'
export type { AttributeModifier, AttributeModifierEx, ModifierPriorityType } from './models/attribute-modifier.ts'
