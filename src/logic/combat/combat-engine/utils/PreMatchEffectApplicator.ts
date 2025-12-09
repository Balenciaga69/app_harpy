import type { CombatContext } from '@/logic/combat/context'
import type { ICharacter } from '@/logic/combat/domain/character'
import type { IEffect } from '@/logic/effect-system/models/effect'
import { isCharacter } from '@/logic/combat/infra/shared'
/**
 * PreMatchEffectApplicator
 *
 * Applies pre-match effects to all characters at combat start.
 * Used for pre-battle modifiers like Chill stacks, resurrection rate boost, etc.
 */
export class PreMatchEffectApplicator {
  /**
   * Apply pre-match effects to all characters in context
   */
  static applyEffects(effects: IEffect[], context: CombatContext): void {
    if (!effects || effects.length === 0) return
    const entities = context.getAllEntities()
    entities.forEach((entity) => {
      if (!isCharacter(entity)) return
      const character = entity as ICharacter
      effects.forEach((effect) => {
        // 為每個角色克隆效果，避免共享狀態
        // TODO: 效果應設計為可克隆或使用工廠模式
        // 例如全體添加 16 層 Chill 效果時，每個角色應有獨立的 Chill Effect 實例
        character.addEffect(effect, context)
      })
    })
  }
}
