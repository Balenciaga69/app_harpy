import type { CombatContext } from '../context'
import { FirstAliveSelector } from './target-select-strategies/FirstAliveSelector'
import type { ITargetSelector } from './target-select-strategies/target-selector'
import type { ITickPhase } from './phases/tick-phase'
import { EffectTickPhase } from './phases/EffectTickPhase'
import { EnergyRegenPhase } from './phases/EnergyRegenPhase'
import { AttackExecutionPhase } from './phases/AttackExecutionPhase'

/**
 * Tick Action System
 *
 * Orchestrates tick processing using a pipeline of independent phases.
 * Each phase handles a specific responsibility (effects, energy, attacks).
 * Phases can be added, replaced, or removed for extensibility.
 */
export class TickActionSystem {
  private context: CombatContext
  private phases: ITickPhase[] = []
  private tickHandler: () => void

  constructor(context: CombatContext, targetSelector?: ITargetSelector) {
    this.context = context
    const selector = targetSelector ?? new FirstAliveSelector()
    // Assemble default execution pipeline
    this.phases = [
      new EffectTickPhase(context),
      new EnergyRegenPhase(context),
      new AttackExecutionPhase(context, selector),
    ]
    this.tickHandler = () => this.processTick()
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** Process all phases sequentially for the current tick */
  private processTick(): void {
    const tick = this.context.getCurrentTick()
    for (const phase of this.phases) {
      phase.execute(this.context, tick)
    }
  }
  /** Add a custom phase to the pipeline */
  addPhase(phase: ITickPhase): void {
    this.phases.push(phase)
  }
  /** Replace a phase by name with a new implementation */
  replacePhase(name: string, newPhase: ITickPhase): void {
    const index = this.phases.findIndex((p) => p.name === name)
    if (index !== -1) {
      this.phases[index]?.dispose?.()
      this.phases[index] = newPhase
    }
  }
  /** Remove a phase by name */
  removePhase(name: string): void {
    const index = this.phases.findIndex((p) => p.name === name)
    if (index !== -1) {
      this.phases[index]?.dispose?.()
      this.phases.splice(index, 1)
    }
  }
  /** Clean up system resources */
  public dispose(): void {
    this.context.eventBus.off('tick:start', this.tickHandler)
    this.phases.forEach((phase) => phase.dispose?.())
    this.phases = []
  }
}
