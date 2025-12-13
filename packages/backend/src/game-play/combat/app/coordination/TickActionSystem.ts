import { FirstAliveSelector } from '../../domain/target-select-strategies/FirstAliveSelector'
import type { ICombatContext } from '../../interfaces/context/ICombatContext'
import type { ITargetSelector } from '../../interfaces/target-select-strategies/ITargetSelector'
import type { ITickPhase } from '../../interfaces/tick-phases/ITickPhase'
import type { ITickActionSystem } from '../../interfaces/coordination/ITickActionSystem'
import { AttackExecutor } from './AttackExecutor'
import { CooldownManager } from './utils/CooldownManager'
import { EffectProcessor } from './utils/EffectProcessor'
import { EnergyManager } from './utils/EnergyManager'
import { EffectTickPhase } from './tick-phases/EffectTickPhase'
import { EnergyRegenPhase } from './tick-phases/EnergyRegenPhase'
import { AttackExecutionPhase } from './tick-phases/AttackExecutionPhase'
/**
 * Tick Action System
 *
 * Orchestrates tick processing using a pipeline of independent phases.
 * Each phase handles a specific responsibility (effects, energy, attacks).
 * Phases can be added, replaced, or removed for extensibility.
 */
export class TickActionSystem implements ITickActionSystem {
  private context: ICombatContext
  private phases: ITickPhase[] = []
  private tickHandler: () => void
  constructor(
    context: ICombatContext,
    targetSelector?: ITargetSelector,
    effectProcessor?: EffectProcessor,
    energyManager?: EnergyManager,
    attackExecutor?: AttackExecutor,
    cooldownManager?: CooldownManager
  ) {
    this.context = context
    const selector = targetSelector ?? new FirstAliveSelector()
    const processor = effectProcessor ?? new EffectProcessor(context)
    const energy = energyManager ?? new EnergyManager(context)
    const executor = attackExecutor ?? new AttackExecutor(context, selector, energy)
    const cooldown = cooldownManager ?? new CooldownManager()

    /* 組裝預設執行管線 */
    this.phases = [
      new EffectTickPhase(processor),
      new EnergyRegenPhase(energy),
      new AttackExecutionPhase(executor, cooldown),
    ]
    this.tickHandler = () => this.processTick()
    this.context.eventBus.on('tick:start', this.tickHandler)
  }
  /** Process all phases sequentially for the current tick */
  public processTick(): void {
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
