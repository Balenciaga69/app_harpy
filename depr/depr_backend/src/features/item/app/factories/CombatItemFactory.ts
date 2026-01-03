import type { IItemDefinition } from '../../interfaces/definitions/IItemDefinition'
import type { IAffixInstance } from '../../interfaces/definitions/IAffixInstance'
import type { ICombatItemView } from '../../interfaces/projections/ICombatItemView'

export class CombatItemFactory {
  /** 將物品定義與詞綴實例轉換為 ICombatItemView */
  create(definition: IItemDefinition, affixInstances: IAffixInstance[]): ICombatItemView {
    return {
      id: definition.id,
      affixInstances: [...affixInstances],
    }
  }
  /** 批量轉換多個物品 */
  createMany(items: Array<{ definition: IItemDefinition; affixInstances: IAffixInstance[] }>): ICombatItemView[] {
    return items.map((item) => this.create(item.definition, item.affixInstances))
  }
}
