import type { AttributeType } from './attribute.core.model'
/** 屬性修飾器  */
export interface AttributeModifier {
  readonly id: string
  readonly type: AttributeType
  readonly value: number
  readonly mode: 'add' | 'multiply'
  readonly source: string
}
/** 修飾器執行順序  */
export const ModifierPriority = {
  LOWEST: 0,
  LOW: 100,
  NORMAL: 500,
  HIGH: 900,
  HIGHEST: 1000,
} as const
/** 修飾器優先級類型  */
export type ModifierPriorityType = (typeof ModifierPriority)[keyof typeof ModifierPriority]
/** 擴展的屬性修飾器 (支援優先級) */
export interface AttributeModifierEx extends AttributeModifier {
  readonly priority: ModifierPriorityType
}
