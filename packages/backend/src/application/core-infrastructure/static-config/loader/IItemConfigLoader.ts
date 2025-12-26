import { RelicTemplate } from '../../../../domain/item/ItemTemplate'
import { ItemRollConfig } from '../../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../../domain/item/roll/ItemRollConstraint'

/** 物品配置資料傳輸物件 */
export interface ItemConfigDTO {
  relicTemplate: RelicTemplate[]
  itemRollConfigs: ItemRollConfig[]
  itemRollConstraints: ItemRollConstraint[]
}

/** 物品配置加載器介面 */
export interface IItemConfigLoader {
  /** 加載物品配置 */
  load(): Promise<ItemConfigDTO>
}
