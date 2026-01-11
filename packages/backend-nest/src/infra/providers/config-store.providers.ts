import {
  GameConfigAssembler,
  InternalAffixConfigLoader,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalShopConfigLoader,
  InternalUltimateConfigLoader,
} from 'src/from-game-core'
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
