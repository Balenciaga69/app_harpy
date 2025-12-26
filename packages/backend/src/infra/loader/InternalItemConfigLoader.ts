import {
  ItemConfigDTO,
  IItemConfigLoader,
} from '../../application/core-infrastructure/static-config/loader/IItemConfigLoader'
import { RelicTemplateList } from '../../data/item/item.data'
import { ItemRollConfigList } from '../../data/item/item-roll-config.data'
import { ItemRollConstraintList } from '../../data/item/item-roll-constraint.data'
export class InternalItemConfigLoader implements IItemConfigLoader {
  async load(): Promise<ItemConfigDTO> {
    const dto: ItemConfigDTO = {
      relicTemplate: RelicTemplateList,
      itemRollConfigs: ItemRollConfigList,
      itemRollConstraints: ItemRollConstraintList,
    }
    return Promise.resolve(dto)
  }
}
