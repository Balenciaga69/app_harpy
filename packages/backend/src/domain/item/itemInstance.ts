import { BaseInstanceFields, WithCreatedAt } from '../../shared/models/BaseInstanceFields'
import { AffixInstance } from '../affix/AffixInstance'
/** 物品實例，代表玩家擁有的特定物品，包含附著的詞綴 */
export interface ItemInstance extends BaseInstanceFields, WithCreatedAt {
  readonly affixInstances: AffixInstance[]
}
/** 遺物實例，是特殊物品類型，額外包含堆疊層數 */
export interface RelicInstance extends ItemInstance, WithCreatedAt {
  readonly currentStacks: number
}
