import { EnemySpawnInfo, EnemyTemplate } from '../../../../domain/entity/Enemy'

/** 敵人配置資料傳輸物件 */
export interface EnemyConfigDTO {
  enemyTemplates: EnemyTemplate[]
  spawnInfos: EnemySpawnInfo[]
}

/** 敵人配置加載器介面 */
export interface IEnemyConfigLoader {
  /** 加載敵人配置 */
  load(): Promise<EnemyConfigDTO>
}
