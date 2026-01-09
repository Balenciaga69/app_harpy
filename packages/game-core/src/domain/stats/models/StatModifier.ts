import { UnitStats } from './UnitStats'

export type UnitStatModifierOperation = 'ADD' | 'MULTIPLY' | 'SET'

export interface UnitStatModifier {
  readonly field: keyof UnitStats
  readonly operation: UnitStatModifierOperation
  readonly value: number
}
