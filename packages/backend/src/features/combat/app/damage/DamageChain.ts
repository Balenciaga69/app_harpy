import type { ICombatContext } from '@/features/combat/context'
import { DamageEvent } from '../../interfaces/damage/damage-event'
import { IDamageStep } from '../../interfaces/damage/damage-step'

/**
 * DamageChain
 *
 * 負責協調傷害計算流程，依序執行各個步驟類別。每個步驟代表一個階段（命中、爆擊、修正、防禦、套用等），
 * 支援流程提前終止與透過掛鉤擴充。
 */
export class DamageChain {
  private steps: IDamageStep[]
  private context: ICombatContext
  constructor(context: ICombatContext, steps: IDamageStep[]) {
    this.context = context
    this.steps = steps
  }
  execute(event: DamageEvent): void {
    for (const step of this.steps) {
      const shouldContinue = step.execute(event, this.context)
      if (!shouldContinue) break
    }
  }
}
