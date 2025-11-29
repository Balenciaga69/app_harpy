import { AttackHandler } from './handlers/attack.handler'
import { DamageHandler } from './handlers/damage.handler'
import { DeathHandler } from './handlers/death.handler'
import { EffectHandler } from './handlers/effect.handler'
import { eventEmitter } from '../eventCore/emitter'
/** 戰鬥引擎 - 協調各處理器的事件分派 */
export class CombatEngine {
  private attackHandler = new AttackHandler()
  private damageHandler = new DamageHandler()
  private deathHandler = new DeathHandler()
  private effectHandler = new EffectHandler()
  /** 設定事件處理器 */
  public setupHandlers(): void {
    eventEmitter.on('attack', this.attackHandler.handle.bind(this.attackHandler))
    eventEmitter.on('damage', this.damageHandler.handle.bind(this.damageHandler))
    eventEmitter.on('death', this.deathHandler.handle.bind(this.deathHandler))
    eventEmitter.on('applyEffect', this.effectHandler.handle.bind(this.effectHandler))
  }
}
