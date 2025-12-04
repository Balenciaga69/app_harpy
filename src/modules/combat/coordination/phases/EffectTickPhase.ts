import type { CombatContext } from '../../context'
import { EffectProcessor } from '../utils/EffectProcessor'
import type { ITickPhase } from './tick-phase'
/**
 * Effect Tick Phase
 *
 * Processes all active effects on entities during each tick.
 * This phase triggers effect callbacks (onTick) for all characters.
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
