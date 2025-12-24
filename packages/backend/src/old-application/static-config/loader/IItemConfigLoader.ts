import { RelicTemplate } from '../../../domain/item/ItemTemplate'
import { ItemRollConfig } from '../../../domain/item/roll/ItemRollConfig'
import { ItemRollConstraint } from '../../../domain/item/roll/ItemRollConstraint'

export interface ItemConfigDTO {
  relicTemplate: RelicTemplate[]
  itemRollConfigs: ItemRollConfig[]
  itemRollConstraints: ItemRollConstraint[]
}

export interface IItemConfigLoader {
  load(): Promise<ItemConfigDTO>
}
