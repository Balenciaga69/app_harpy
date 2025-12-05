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
/** Factory function for creating CombatFailure */
export function createFailure(
  code: FailureCode,
  message: string,
  context?: Record<string, unknown>,
  tick?: number
): CombatFailure {
  return { code, message, context, tick }
}
/** Common failure factory helpers */
export const Failures = {
  entityNotFound: (id: string, tick?: number): CombatFailure =>
    createFailure(CombatFailureCode.ENTITY_NOT_FOUND, `Entity not found: ${id}`, { entityId: id }, tick),
  characterNotFound: (id: string, tick?: number): CombatFailure =>
    createFailure(CombatFailureCode.CHARACTER_NOT_FOUND, `Character not found: ${id}`, { characterId: id }, tick),
  characterDead: (id: string, tick?: number): CombatFailure =>
    createFailure(CombatFailureCode.CHARACTER_DEAD, `Character is dead: ${id}`, { characterId: id }, tick),
  noValidTargets: (attackerId: string, tick?: number): CombatFailure =>
    createFailure(
      CombatFailureCode.NO_VALID_TARGETS,
      `No valid targets for attacker: ${attackerId}`,
      { attackerId },
      tick
    ),
  effectNotFound: (id: string, tick?: number): CombatFailure =>
    createFailure(CombatFailureCode.EFFECT_NOT_FOUND, `Effect not found: ${id}`, { effectId: id }, tick),
  missingRequiredField: (fieldName: string, context?: string): CombatFailure =>
    createFailure(
      CombatFailureCode.MISSING_REQUIRED_FIELD,
      `Missing required field: ${fieldName}${context ? `. ${context}` : ''}`,
      { fieldName }
    ),
  unknown: (message: string, tick?: number): CombatFailure =>
    createFailure(CombatFailureCode.UNKNOWN, message, undefined, tick),
}
