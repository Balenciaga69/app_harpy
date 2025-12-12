import { FirstAliveSelector } from '../../domain/target-select-strategies/FirstAliveSelector'
import { ICombatContext } from '../../interfaces/context/ICombatContext'
import { ITargetSelector } from '../../interfaces/target-select-strategies/ITargetSelector'
import { ITickPhase } from '../../interfaces/tick-phases/ITickPhase'
import { AttackExecutor } from './utils/AttackExecutor'
import { CooldownManager } from './utils/CooldownManager'
import { EffectProcessor } from './utils/EffectProcessor'
import { EnergyManager } from './utils/EnergyManager'
/**
 * Tick Action System
 *
 * Orchestrates tick processing using a pipeline of independent phases.
 * Each phase handles a specific responsibility (effects, energy, attacks).
 * Phases can be added, replaced, or removed for extensibility.
 */
export class TickActionSystem {
  private context: ICombatContext
  private phases: ITickPhase[] = []
  private tickHandler: () => void
  constructor(context: ICombatContext, targetSelector?: ITargetSelector) {
    this.context = context
    const selector = targetSelector ?? new FirstAliveSelector()
    // Create utility instances
    const effectProcessor = new EffectProcessor(context) // TODO: 考慮用工廠或依賴注入
    const energyManager = new EnergyManager(context) // TODO: 考慮用工廠或依賴注入
    const attackExecutor = new AttackExecutor(context, selector, energyManager) // TODO: 考慮用工廠或依賴注入
    const cooldownManager = new CooldownManager() // TODO: 考慮用工廠或依賴注入
    // Assemble default execution pipeline with injected dependencies
    this.phases = [
      new EffectTickPhase(effectProcessor),
      new EnergyRegenPhase(energyManager),
      new AttackExecutionPhase(attackExecutor, cooldownManager),
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
