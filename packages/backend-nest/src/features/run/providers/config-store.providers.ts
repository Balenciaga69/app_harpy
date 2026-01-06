import {
  GameConfigAssembler,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalUltimateConfigLoader,
  InternalAffixConfigLoader,
  InternalShopConfigLoader,
} from 'src/from-game-core'

/**
 * 配置存儲提供者
 * 負責組裝和提供遊戲配置（敵人、物品、職業等）
 */
export const configStoreProviders = [
  {
    provide: 'CONFIG_STORE',
    useFactory: async () => {
      const assembler = new GameConfigAssembler(
        new InternalEnemyConfigLoader(),
        new InternalItemConfigLoader(),
        new InternalProfessionConfigLoader(),
        new InternalUltimateConfigLoader(),
        new InternalAffixConfigLoader(),
        new InternalShopConfigLoader()
      )
      await assembler.assembleAllConfigs()
      return {
        enemyStore: assembler.getEnemyStore(),
        itemStore: assembler.getItemStore(),
        professionStore: assembler.getProfessionStore(),
        ultimateStore: assembler.getUltimateStore(),
        affixStore: assembler.getAffixStore(),
        shopStore: assembler.getShopStore(),
      }
    },
  },
]
