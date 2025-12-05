import type { CombatContext } from '../../context'
/**
 * Tick Phase Interface
 *
 * Represents a single phase in the tick processing pipeline.
 * Each phase handles a specific responsibility (effects, energy, attacks, etc.)
 */
export interface ITickPhase {
  /** Phase identifier for debugging and replacement */
  readonly name: string
  /** Execute this phase's logic for the current tick */
  execute(context: CombatContext, tick: number): void
  /** Optional cleanup when phase is removed or system disposed */
  dispose?(): void
}
