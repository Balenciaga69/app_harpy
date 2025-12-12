import type { CombatContext } from '../../context'
import { EffectProcessor } from '../utils/EffectProcessor'
import type { ITickPhase } from './tick-phase'
/**
 * 效果 tick 階段
 *
 * 於每次 tick 期間處理實體上所有活躍效果。
 * 此階段將觸發所有角色的效果回調函式 (onTick)。
 */
export class EffectTickPhase implements ITickPhase {
  readonly name = 'EffectTick'
  private processor: EffectProcessor
  constructor(context: CombatContext) {
    this.processor = new EffectProcessor(context)
  }
  execute(): void {
    this.processor.processEffects()
  }
}
