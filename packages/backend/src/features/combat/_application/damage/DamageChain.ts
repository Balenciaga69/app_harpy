import type { ICombatContext } from '@/features/combat/context'
import { AfterApplyStep } from '../../_domain/damage/step/AfterApplyStep'
import { ApplyDamageStep } from '../../_domain/damage/step/ApplyDamageStep'
import { BeforeApplyStep } from '../../_domain/damage/step/BeforeApplyStep'
import { BeforeDamageStep } from '../../_domain/damage/step/BeforeDamageStep'
import { CriticalStep } from '../../_domain/damage/step/CriticalStep'
import { DamageModifyStep } from '../../_domain/damage/step/DamageModifyStep'
import { DefenseCalculationStep } from '../../_domain/damage/step/DefenseCalculationStep'
import { HitCheckStep } from '../../_domain/damage/step/HitCheckStep'
import { DamageEvent } from '../../_interfaces/damage/damage-event'
import { ICombatHook } from '../../_interfaces/damage/combat-hook'

/**
 * DamageChain
 *
 * 負責協調傷害計算流程，依序執行各個步驟類別。每個步驟代表一個階段（命中、爆擊、修正、防禦、套用等），
 * 支援流程提前終止與透過掛鉤擴充。
 */
export class DamageChain {
  private steps: ICombatHook[]
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
