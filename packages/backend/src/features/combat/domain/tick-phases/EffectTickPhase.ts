import type { ICombatContext } from '../../interfaces/context/ICombatContext'
// TODO: EffectProcessor 應該透過 interface 注入
import type { EffectProcessor } from '../../app/coordination/utils/EffectProcessor'
import type { ITickPhase } from '../../interfaces/tick-phases/ITickPhase'
/**
 * 效果 tick 階段
 *
 * 於每次 tick 期間處理實體上所有活躍效果。
 * 此階段將觸發所有角色的效果回調函式 (onTick)。
 */
export class EffectTickPhase implements ITickPhase {
  readonly name = 'EffectTick'
  private processor: EffectProcessor
  constructor(processor: EffectProcessor) {
    this.processor = processor
  }
  execute(): void {
    this.processor.processEffects()
  }
}
