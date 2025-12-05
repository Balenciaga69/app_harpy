import type { IEffectLifeHook } from './effect-life-hook'
/**
 * Effect interface
 *
 * Base interface for all effects. Effects can modify character attributes or
 * intercept combat events by implementing combat hooks.
 * Each effect must have a unique ID and name for identification and logging.
 *
 * Extends IEffectLifeHook to provide lifecycle management (onApply/onRemove/onTick).
 * Effects that need to modify damage should also implement ICombatHook.
 */
export interface IEffect extends IEffectLifeHook {
  readonly id: string
  readonly name: string
}
