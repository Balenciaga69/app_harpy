import type { IDamageStep } from '../_interfaces/damage/damage-step'
import { AfterApplyStep } from '../../_domain/damage/step/AfterApplyStep'
import { ApplyDamageStep } from '../../_domain/damage/step/ApplyDamageStep'
import { BeforeApplyStep } from '../../_domain/damage/step/BeforeApplyStep'
import { BeforeDamageStep } from '../../_domain/damage/step/BeforeDamageStep'
import { CriticalStep } from '../../_domain/damage/step/CriticalStep'
import { DamageModifyStep } from '../../_domain/damage/step/DamageModifyStep'
import { DefenseCalculationStep } from '../../_domain/damage/step/DefenseCalculationStep'
import { HitCheckStep } from '../../_domain/damage/step/HitCheckStep'

/**
 * DamageStepFactory
 *
 * 負責實例化 domain 層的傷害計算步驟陣列，供 app 層注入使用。
 * 遵循 infra -> interfaces -> app -> domain 的單向依賴規則。
 */
export class DamageStepFactory {
  /**
   * 創建預設傷害計算步驟鏈
   * @returns 步驟陣列
   */
  static createSteps(): IDamageStep[] {
    return [
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
}
