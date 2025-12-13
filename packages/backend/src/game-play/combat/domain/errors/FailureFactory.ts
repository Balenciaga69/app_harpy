import type { CombatFailure, FailureCode } from '../../interfaces/errors/CombatFailure'
import { CombatFailureCode } from '../../interfaces/errors/CombatFailure'
/** 創建 CombatFailure 的工廠函數 */
export function createFailure(
  code: FailureCode,
  message: string,
  context?: Record<string, unknown>,
  tick?: number
): CombatFailure {
  return { code, message, context, tick }
}
/** 常用的 CombatFailure 建立輔助函數 */
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
