import type { ICombatEffectServices } from '@/logic/effect-system'
import type { ICharacterFacade } from '@/logic/effect-system'
import type { ICombatContext } from '../context'
import type { ICharacter } from '../domain/character/models/character'
/**
 * 戰鬥效果服務適配器
 *
 * 將 CombatContext 適配為 ICombatEffectServices 介面。
 * 這是適配器模式的應用，讓 Effect 系統不直接依賴 CombatContext。
 */
export class CombatEffectServices implements ICombatEffectServices {
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
  }
  getCharacter(characterId: string): ICharacterFacade {
    const char = this.context.registry.getCharacter(characterId) as ICharacter
    if (!char) {
      throw new Error(`[CombatEffectServices] Character ${characterId} not found`)
    }
    // 返回符合 ICharacterFacade 的最小介面
    return {
      id: char.id,
      getAttribute: (type) => char.getAttribute(type),
      addAttributeModifier: (modifier) => char.addAttributeModifier(modifier),
      removeAttributeModifier: (id) => char.removeAttributeModifier(id),
    }
  }
  emitEvent(
    // TODO: 回家記得優化 這邊爛code
    eventName: Parameters<ICombatContext['eventBus']['emit']>['0'],
    payload: Parameters<ICombatContext['eventBus']['emit']>['1']
  ): void {
    this.context.eventBus.emit(eventName, payload)
  }
  getCurrentTick(): number {
    return this.context.getCurrentTick()
  }
  random(): number {
    return this.context.rng.next()
  }
}
