import { ItemRollConfig } from '../../domain/item/roll/ItemRollConfig'
// 商店刷新物品生成配置
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
// 賽後獎勵物品生成配置
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
