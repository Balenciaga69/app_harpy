import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffect } from '../../domain/affix/effect/AffixEffect'
import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'

export interface EnemyConfig {
  enemyTemplate: EnemyTemplate
  affixTemplates: AffixTemplate[]
  affixEffects: AffixEffect[]
  ultimateTemplate: UltimateTemplate
}

export interface EnemyConfigDTO {
  configs: EnemyConfig[]
  spawnInfo: EnemySpawnInfo[]
}

export interface IEnemyConfigLoader {
  load(): Promise<EnemyConfigDTO>
}
