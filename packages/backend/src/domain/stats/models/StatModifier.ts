import { UnitStats } from './UnitStats'
/** 統計修飾符操作類型，決定如何應用修飾符 */
export type UnitStatModifierOperation = 'ADD' | 'MULTIPLY' | 'SET'
/** 統計修飾符，對單位的特定統計屬性應用操作 */
export interface UnitStatModifier {
  readonly field: keyof UnitStats
  readonly operation: UnitStatModifierOperation
  readonly value: number
}
