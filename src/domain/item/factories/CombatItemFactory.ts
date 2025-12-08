import type { IItemDefinition } from '../definitions'
import type { IAffixInstance } from '../affixes'
import type { ICombatItemView } from '../projections'
/**
 * CombatItemFactory
 *
 * 將物品定義與詞綴實例轉換為 Combat Engine 需要的視角投影。
 * 純工廠類別，不依賴任何框架。
 */
export class CombatItemFactory {
  /** 將物品定義與詞綴實例轉換為 ICombatItemView */
  create(definition: IItemDefinition, affixInstances: IAffixInstance[]): ICombatItemView {
    return {
      id: definition.id,
      effectTemplateIds: [...definition.effectTemplateIds],
      affixInstances: [...affixInstances],
    }
  }
  /** 批量轉換多個物品 */
  createMany(items: Array<{ definition: IItemDefinition; affixInstances: IAffixInstance[] }>): ICombatItemView[] {
    return items.map((item) => this.create(item.definition, item.affixInstances))
  }
}
