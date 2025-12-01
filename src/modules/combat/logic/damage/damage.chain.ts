import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from './models'
import type { IDamageStep } from './steps'
import {
  AfterApplyStep,
  ApplyDamageStep,
  BeforeApplyStep,
  BeforeDamageStep,
  CriticalStep,
  DamageModifyStep,
  DefenseCalculationStep,
  HitCheckStep,
} from './steps'
/**
 * DamageChain：協調傷害計算流程的責任鏈。
 *
 * 設計理念：
 * - 將完整的傷害計算過程分為明確階段，並協調 Hook 的執行順序。
 * - 使用 Step 模式，每個階段由獨立的 Step class 負責，實現單一職責。
 * - 支援 ICombatHook 的擴展，允許各種效果在不同階段介入流程。
 * - 遵循開放封閉原則：添加新效果只需新增 Step class。
 *
 * 主要職責：
 * - 按順序執行各個傷害計算階段。
 * - 支援階段的提前終止（如未命中、被阻止）。
 */
export class DamageChain {
  private steps: IDamageStep[]
  private context: CombatContext
  constructor(context: CombatContext) {
    this.context = context
    // 定義傷害計算的完整流程
    this.steps = [
      new BeforeDamageStep(), // 階段1：傷害發起
      new HitCheckStep(), // 階段2：命中判定
      new CriticalStep(), // 階段3：暴擊判定
      new DamageModifyStep(), // 階段4：傷害修飾
      new DefenseCalculationStep(), // 階段5：防禦計算
      new BeforeApplyStep(), // 階段6：最終確認
      new ApplyDamageStep(), // 應用傷害
      new AfterApplyStep(), // 階段7：傷害應用後
    ]
  }
  /**
   * 執行完整的傷害計算流程
   */
  execute(event: DamageEvent): void {
    for (const step of this.steps) {
      const shouldContinue = step.execute(event, this.context)
      if (!shouldContinue) {
        break // 提前終止流程
      }
    }
  }
}
