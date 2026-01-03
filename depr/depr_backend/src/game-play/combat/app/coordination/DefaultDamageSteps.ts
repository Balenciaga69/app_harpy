import { IDamageStep } from '../../interfaces/damage/IDamageStep'
import { HitCheckStep } from '../../domain/damage/step/HitCheckStep'
import { CriticalStep } from '../../domain/damage/step/CriticalStep'
import { DamageModifyStep } from '../../domain/damage/step/DamageModifyStep'
import { DefenseCalculationStep } from '../../domain/damage/step/DefenseCalculationStep'
import { BeforeDamageStep } from '../../domain/damage/step/BeforeDamageStep'
import { BeforeApplyStep } from '../../domain/damage/step/BeforeApplyStep'
import { ApplyDamageStep } from '../../domain/damage/step/ApplyDamageStep'
import { AfterApplyStep } from '../../domain/damage/step/AfterApplyStep'
/**
 * 建立預設的傷害計算步驟
 */
export function createDefaultDamageSteps(): IDamageStep[] {
  return [
    new HitCheckStep(),
    new CriticalStep(),
    new DamageModifyStep(),
    new DefenseCalculationStep(),
    new BeforeDamageStep(),
    new BeforeApplyStep(),
    new ApplyDamageStep(),
    new AfterApplyStep(),
  ]
}
