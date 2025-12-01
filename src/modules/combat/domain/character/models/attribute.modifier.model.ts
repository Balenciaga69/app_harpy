import type { AttributeType } from './attribute.core.model'
/** Attribute modifier */
export interface AttributeModifier {
  readonly id: string
  readonly type: AttributeType
  readonly value: number
  readonly mode: 'add' | 'multiply'
  readonly source: string
}
/**
 * Modifier execution priority
 *
 * Design concept:
 * - Control calculation order of attribute modifiers from different sources to ensure correctness of game mechanics.
 * - Smaller numbers execute first, larger numbers execute later.
 * - Used with AttributeCalculator's sortModifiersByPriority method.
 *
 * Usage scenarios: (Tentative, game mechanics not yet confirmed)
 * - LOWEST (0): Basic penalty effects (disease, curse)
 * - LOW (100): Temporary debuff effects (slow, weaken)
 * - NORMAL (500): General Buff/Debuff, equipment attributes (default)
 * - HIGH (900): Elite effects, set bonuses
 * - HIGHEST (1000): Artifact bonuses, ultimate passives
 *
 * Current status:
 * - ✅ AttributeCalculator has implemented priority sorting logic
 * - ⚠️ Currently all Modifiers use NORMAL priority (differentiation not yet implemented)
 *
 * TODO: Pending implementation examples:
 * - When implementing artifact system, set priority: ModifierPriority.HIGHEST
 * - When implementing set effects, set priority: ModifierPriority.HIGH
 * - When implementing curse/disease effects, set priority: ModifierPriority.LOWEST
 *
 * Notes:
 * - If all Modifiers use same priority, execute in order of addition.
 * - Modifying priority may affect final attribute calculation results, adjust cautiously.
 */
export const ModifierPriority = {
  LOWEST: 0,
  LOW: 100,
  NORMAL: 500,
  HIGH: 900,
  HIGHEST: 1000,
} as const
/** Modifier priority type */
export type ModifierPriorityType = (typeof ModifierPriority)[keyof typeof ModifierPriority]
/** Extended attribute modifier (supports priority) */
export interface AttributeModifierEx extends AttributeModifier {
  readonly priority: ModifierPriorityType
}
