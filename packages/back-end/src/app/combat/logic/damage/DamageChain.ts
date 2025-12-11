import type { ICombatContext } from '@/app/combat/context'
import type { DamageEvent } from './models/damage-event'
import { AfterApplyStep } from './steps/AfterApplyStep'
import { ApplyDamageStep } from './steps/ApplyDamageStep'
import { BeforeApplyStep } from './steps/BeforeApplyStep'
import { BeforeDamageStep } from './steps/BeforeDamageStep'
import { CriticalStep } from './steps/CriticalStep'
import { DamageModifyStep } from './steps/DamageModifyStep'
import type { IDamageStep } from './steps/DamageStep.interface'
import { DefenseCalculationStep } from './steps/DefenseCalculationStep'
import { HitCheckStep } from './steps/HitCheckStep'
/**
 * DamageChain
 *
 * 負責協調傷害計算流程，依序執行各個步驟類別。每個步驟代表一個階段（命中、爆擊、修正、防禦、套用等），
 * 支援流程提前終止與透過掛鉤擴充。
 */
export class DamageChain {
  private steps: IDamageStep[]
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
    this.steps = [
      new BeforeDamageStep(),
      new HitCheckStep(),
      new CriticalStep(),
      new DamageModifyStep(),
      new DefenseCalculationStep(),
      new BeforeApplyStep(),
      new ApplyDamageStep(),
      new AfterApplyStep(),
    ]
  }
  execute(event: DamageEvent): void {
    for (const step of this.steps) {
      const shouldContinue = step.execute(event, this.context)
      if (!shouldContinue) break
    }
  }
}
