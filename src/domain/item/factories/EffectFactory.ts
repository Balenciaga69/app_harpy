import type { IAffixInstance } from '../affixes'
import type { ICombatItemView } from '../projections'
/** 效果建構函數類型 */
export type EffectBuilder<TEffect> = (affixInstance: IAffixInstance) => TEffect
/**
 * EffectFactory
 *
 * 將效果模板 ID 與詞綴實例轉換為具體的效果實例。
 * 使用註冊機制，允許外部註冊效果建構邏輯。
 * 泛型設計，可適配不同的效果介面實作。
 */
export class EffectFactory<TEffect> {
  private readonly builders = new Map<string, EffectBuilder<TEffect>>()
  /** 註冊效果建構器 */
  register(templateId: string, builder: EffectBuilder<TEffect>): void {
    this.builders.set(templateId, builder)
  }
  /** 根據詞綴實例生成效果（需已註冊對應的效果模板） */
  createFromAffix(templateId: string, affixInstance: IAffixInstance): TEffect | null {
    const builder = this.builders.get(templateId)
    if (!builder) return null
    return builder(affixInstance)
  }
  /** 從戰鬥物品視角生成所有效果 */
  createFromCombatItem(itemView: ICombatItemView): TEffect[] {
    const effects: TEffect[] = []
    for (const affixInstance of itemView.affixInstances) {
      const effect = this.createFromAffix(affixInstance.definitionId, affixInstance)
      if (effect) effects.push(effect)
    }
    return effects
  }
  /** 檢查是否已註冊指定的效果模板 */
  hasBuilder(templateId: string): boolean {
    return this.builders.has(templateId)
  }
}
