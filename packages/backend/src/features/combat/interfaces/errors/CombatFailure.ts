/**
 * Combat Failure Codes
 *
 * Enumeration of all possible failure reasons in combat system.
 * Designed for easy localization and programmatic handling.
 */
export const CombatFailureCode = {
  // Entity related
  ENTITY_NOT_FOUND: 'ENTITY_NOT_FOUND',
  CHARACTER_NOT_FOUND: 'CHARACTER_NOT_FOUND',
  CHARACTER_DEAD: 'CHARACTER_DEAD',
  // Effect related
  EFFECT_NOT_FOUND: 'EFFECT_NOT_FOUND',
  EFFECT_ALREADY_EXISTS: 'EFFECT_ALREADY_EXISTS',
  // Equipment related
  EQUIPMENT_NOT_FOUND: 'EQUIPMENT_NOT_FOUND',
  SLOT_ALREADY_OCCUPIED: 'SLOT_ALREADY_OCCUPIED',
  // Combat flow related
  INVALID_TARGET: 'INVALID_TARGET',
  NO_VALID_TARGETS: 'NO_VALID_TARGETS',
  COMBAT_ALREADY_ENDED: 'COMBAT_ALREADY_ENDED',
  // Attribute related
  INVALID_ATTRIBUTE: 'INVALID_ATTRIBUTE',
  ATTRIBUTE_OUT_OF_RANGE: 'ATTRIBUTE_OUT_OF_RANGE',
  // Builder/Configuration related
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  // Generic
  UNKNOWN: 'UNKNOWN',
} as const
export type FailureCode = (typeof CombatFailureCode)[keyof typeof CombatFailureCode]
/**
 * CombatFailure
 *
 * Value object representing a failure in combat operations.
 * Used internally for error tracking without throwing exceptions.
 * Contains enough info for debugging and logging.
 */
export interface CombatFailure {
  readonly code: FailureCode
  readonly message: string
  readonly context?: Record<string, unknown>
  readonly tick?: number
}
