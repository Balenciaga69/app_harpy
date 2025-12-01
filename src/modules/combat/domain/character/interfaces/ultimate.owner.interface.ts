import type { IUltimateAbility } from '@/modules/combat/coordination'
/**
 * Ultimate owner interface
 *
 * Design concept:
 * - Define association contract between character and ultimate
 * - Support dynamic replacement of ultimate (similar to equipment system)
 * - Implement diversification of ultimate through strategy pattern
 *
 * Notes:
 * - Depends on IUltimateAbility interface from coordination layer (reasonable unidirectional dependency)
 * - Will not cause circular dependency (domain → coordination is correct dependency direction)
 */
export interface IUltimateOwner {
  /** Get ultimate (if any) */
  getUltimate(): IUltimateAbility | undefined
  /** Set ultimate */
  setUltimate(ultimate: IUltimateAbility): void
}
