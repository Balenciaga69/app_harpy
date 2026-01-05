/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common'
import {
  GameConfigAssembler,
  InternalAffixConfigLoader,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalUltimateConfigLoader,
  InternalShopConfigLoader,
} from '@app-harpy/game-core'
/**
 * 遊戲配置服務：單例管理 ConfigStore
 * 職責：在應用啟動時載入所有靜態配置
 */
@Injectable()
export class ConfigService {
  private configAssembler: any
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
  /**
   * 取得 ConfigStore（延遲初始化）
   * 副作用：首次呼叫時會載入所有靜態配置
   */
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
