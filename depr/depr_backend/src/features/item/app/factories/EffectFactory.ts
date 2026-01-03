import type { IAffixInstance } from '../../interfaces/definitions/IAffixInstance'
import type { ICombatItemView } from '../../interfaces/projections/ICombatItemView'
import type { IEffectTemplateInfo } from '../../interfaces/factories/IEffectTemplateInfo'
import type { AffixDefinitionRegistry } from '../../domain/registries/AffixDefinitionRegistry'
/**
 * EffectFactory
 *
 * 負責從物品的詞綴實例提取效果模板資訊。
 * 不負責實際建構效果實例，避免 domain 層依賴 logic 層。
 * 提供純資料轉換功能。
 */
export class EffectFactory {
  private affixRegistry: AffixDefinitionRegistry
  constructor(affixRegistry: AffixDefinitionRegistry) {
    this.affixRegistry = affixRegistry
  }
  /**
   * 從單個詞綴實例提取效果模板資訊
   */
  createFromAffix(affixInstance: IAffixInstance): IEffectTemplateInfo | null {
    const affixDef = this.affixRegistry.get(affixInstance.definitionId)
    if (!affixDef) return null
    return {
      templateId: affixDef.effectTemplateId,
      affixInstance: affixInstance,
    }
  }
  /**
   * 從戰鬥物品視角提取所有效果模板資訊
   */
  createFromCombatItem(itemView: ICombatItemView): IEffectTemplateInfo[] {
    const effectInfos: IEffectTemplateInfo[] = []
    for (const affixInstance of itemView.affixInstances) {
      const effectInfo = this.createFromAffix(affixInstance)
      if (effectInfo) {
        effectInfos.push(effectInfo)
      }
    }
    return effectInfos
  }
}
