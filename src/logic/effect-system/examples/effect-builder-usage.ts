/**
 * EffectBuilder 使用範例
 *
 * 展示如何使用 EffectBuilder 從物品詞綴建構效果實例。
 */
import { EffectBuilder, registerDefaultClassEffects } from '@/logic/effect-system'
import { EffectFactory } from '@/domain/item/factories/EffectFactory'
import { AffixDefinitionRegistry } from '@/domain/item/registries/AffixDefinitionRegistry'
import type { ICombatItemView } from '@/domain/item/projections/combat-item-view'
import type { IEffect } from '@/logic/effect-system'
/**
 * 初始化效果系統
 *
 * 應在應用啟動時調用一次。
 */
function initializeEffectSystem() {
  // 註冊所有內建的 Class 效果
  registerDefaultClassEffects()
}
/**
 * 從戰鬥物品建構效果實例
 *
 * @param combatItem 戰鬥物品視角
 * @param affixRegistry 詞綴定義註冊表
 * @returns 效果實例陣列
 */
function buildEffectsFromItem(combatItem: ICombatItemView, affixRegistry: AffixDefinitionRegistry): IEffect[] {
  // 1. 使用 EffectFactory 提取效果模板資訊
  const effectFactory = new EffectFactory(affixRegistry)
  const templateInfos = effectFactory.createFromCombatItem(combatItem)
  // 2. 使用 EffectBuilder 建構效果實例
  const effectBuilder = new EffectBuilder()
  const effects = effectBuilder.buildEffects(templateInfos)
  return effects
}
/**
 * 完整流程範例
 */
function exampleUsage() {
  // 步驟 1: 初始化效果系統
  initializeEffectSystem()
  // 步驟 2: 準備物品與註冊表
  const affixRegistry = new AffixDefinitionRegistry()
  // ... 註冊詞綴定義
  // 步驟 3: 假設已有戰鬥物品實例
  const combatItem: ICombatItemView = {
    id: 'item_001',
    affixInstances: [
      {
        definitionId: 'affix_attack_damage',
        rolledValue: 35,
      },
      {
        definitionId: 'affix_critical_chance',
        rolledValue: 0.12,
      },
    ],
  }
  // 步驟 4: 建構效果實例
  const effects = buildEffectsFromItem(combatItem, affixRegistry)
  // 步驟 5: 將效果注入到角色
  // character.addEffects(effects, services)
  return effects
}
// 導出範例函式
export { initializeEffectSystem, buildEffectsFromItem, exampleUsage }
