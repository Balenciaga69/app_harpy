import { Injectable } from '@nestjs/common'
import {
  GameConfigAssembler,
  InternalAffixConfigLoader,
  InternalEnemyConfigLoader,
  InternalItemConfigLoader,
  InternalProfessionConfigLoader,
  InternalShopConfigLoader,
  InternalUltimateConfigLoader,
} from '../from-game-core'
/**
 * 遊戲配置服務：單例管理 ConfigStore
 * 職責：在應用啟動時載入所有靜態配置
 * 設計：延遲初始化以加快應用啟動速度
 *
 * 注意：game-core 的類型定義暫時有限制，故 eslint-disable 作用於整個文件
 * TODO：待 game-core 類型完善後移除此註解
 */
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
