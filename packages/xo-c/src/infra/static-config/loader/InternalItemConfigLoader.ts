import { IItemConfigLoader, ItemConfigDTO } from '../../../application/core-infrastructure/static-config/IConfigLoaders'
import { RelicTemplateList } from '../../../data/item/item.data'
import { ItemRollConfigList, RewardRollConfigList } from '../../../data/item/item-roll-config.data'
import { ItemRollConstraintList } from '../../../data/item/item-roll-constraint.data'
export class InternalItemConfigLoader implements IItemConfigLoader {
  async load(): Promise<ItemConfigDTO> {
    const dto: ItemConfigDTO = {
      relicTemplate: RelicTemplateList,
      itemRollConfigs: ItemRollConfigList.filter((config) => config.sourceType !== 'POST_COMBAT_REWARD'),
      itemRollConstraints: ItemRollConstraintList,
      rewardRollConfigs: RewardRollConfigList,
    }
    return dto;
  }
}
