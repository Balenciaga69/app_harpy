// 重新導出共享屬性系統（向後兼容）
export { AttributeManager, AttributeCalculator } from '@/logic/attribute-system'
export type {
  IAttributeCalculator,
  AttributeModifier,
  AttributeModifierEx,
  ModifierPriorityType,
} from '@/logic/attribute-system'
export { ModifierPriority } from '@/logic/attribute-system'
// 重新導出 domain 基礎類型
export { createDefaultAttributes } from '@/domain/attribute'
export type { AttributeType, BaseAttributeValues } from '@/domain/attribute'
