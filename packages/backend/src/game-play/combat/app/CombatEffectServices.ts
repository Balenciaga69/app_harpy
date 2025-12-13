import type { ICombatEffectServices } from '@/features/effect'
import type { ICharacterFacade } from '@/features/effect'
import { ICombatContext } from '../interfaces/context/ICombatContext'
import { ICharacter } from '../interfaces/character/ICharacter'
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
      setCurrentHpClamped: (value) => char.setCurrentHpClamped(value),
      get isDead() {
        return char.isDead
      },
      set isDead(value: boolean) {
        char.isDead = value
      },
    }
  }
  emitEvent(eventName: string, payload: unknown): void {
    this.context.eventBus.emit(eventName as never, payload as never)
  }
  getCurrentTick(): number {
    return this.context.getCurrentTick()
  }
  random(): number {
    return this.context.rng.next()
  }
}
