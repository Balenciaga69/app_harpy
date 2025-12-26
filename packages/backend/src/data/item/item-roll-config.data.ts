// ItemRollType
// ItemRollSourceType
// ItemRollConfig
import { ItemRollConfig } from '../../domain/item/roll/ItemRollConfig'
const ShopRefresh: ItemRollConfig = {
  sourceType: 'SHOP_REFRESH',
  itemTypeWeights: {
    RELIC: 1,
  },
  rarityWeights: {
    COMMON: 32,
    RARE: 16,
    EPIC: 8,
    LEGENDARY: 1,
  },
}
const PostGameReward: ItemRollConfig = {
  sourceType: 'POST_GAME_REWARD',
  itemTypeWeights: {
    RELIC: 1,
  },
  rarityWeights: {
    COMMON: 0,
    RARE: 16,
    EPIC: 4,
    LEGENDARY: 1,
  },
}
export const ItemRollConfigList: ItemRollConfig[] = [ShopRefresh, PostGameReward]
