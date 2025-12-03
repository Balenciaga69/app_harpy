import type { ICombatContext } from '@/modules/combat/context'
import type { DamageEvent } from './models/damage-event'
import type { IDamageStep } from './steps/DamageStep.interface'
import { AfterApplyStep } from './steps/AfterApplyStep'
import { ApplyDamageStep } from './steps/ApplyDamageStep'
import { BeforeApplyStep } from './steps/BeforeApplyStep'
import { BeforeDamageStep } from './steps/BeforeDamageStep'
import { CriticalStep } from './steps/CriticalStep'
import { DamageModifyStep } from './steps/DamageModifyStep'
import { DefenseCalculationStep } from './steps/DefenseCalculationStep'
import { HitCheckStep } from './steps/HitCheckStep'
/**
 * DamageChain
 *
 * Coordinates the damage calculation process by executing a sequence of step classes. Each step
 * represents a stage (hit, crit, modify, defense, apply, etc). Supports early termination and extension via hooks.
 */
export class DamageChain {
  private steps: IDamageStep[]
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
    // Define complete damage calculation process
    this.steps = [
      new BeforeDamageStep(), // Stage 1: Damage initiation
      new HitCheckStep(), // Stage 2: Hit check
      new CriticalStep(), // Stage 3: Critical check
      new DamageModifyStep(), // Stage 4: Damage modification
      new DefenseCalculationStep(), // Stage 5: Defense calculation
      new BeforeApplyStep(), // Stage 6: Final confirmation
      new ApplyDamageStep(), // Apply damage
      new AfterApplyStep(), // Stage 7: After damage apply
    ]
  }
  /**
   * Execute complete damage calculation process
   */
  execute(event: DamageEvent): void {
    for (const step of this.steps) {
      const shouldContinue = step.execute(event, this.context)
      if (!shouldContinue) {
        break // Terminate process early
      }
    }
  }
}
