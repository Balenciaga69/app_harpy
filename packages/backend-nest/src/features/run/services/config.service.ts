import { Injectable } from '@nestjs/common'
import {
  GameConfigAssembler,
  InternalAffixConfigLoader,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalShopConfigLoader,
  InternalUltimateConfigLoader,
} from '../../../from-game-core'
@Injectable()
export class ConfigService {
  private configAssembler: GameConfigAssembler
  private isInitialized = false
  constructor() {
    this.configAssembler = new GameConfigAssembler(
      new InternalEnemyConfigLoader(),
      new InternalItemConfigLoader(),
      new InternalProfessionConfigLoader(),
      new InternalUltimateConfigLoader(),
      new InternalAffixConfigLoader(),
      new InternalShopConfigLoader()
    )
  }
  async getConfigStore() {
    if (!this.isInitialized) {
      await this.configAssembler.assembleAllConfigs()
      this.isInitialized = true
    }
    return {
      affixStore: this.configAssembler.getAffixStore(),
      enemyStore: this.configAssembler.getEnemyStore(),
      itemStore: this.configAssembler.getItemStore(),
      professionStore: this.configAssembler.getProfessionStore(),
      ultimateStore: this.configAssembler.getUltimateStore(),
      shopStore: this.configAssembler.getShopStore(),
    }
  }
}
