import { AffixTemplate } from '../../domain/affix/AffixTemplate'
import { AffixEffect } from '../../domain/affix/effect/AffixEffect'
import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { UltimateEffect } from '../../domain/ultimate/UltimateEffect'
import { UltimateTemplate } from '../../domain/ultimate/UltimateTemplate'

export interface EnemyConfig {
  enemyTemplate: EnemyTemplate
  affixTemplates: AffixTemplate[]
  affixEffects: AffixEffect[]
  ultimateTemplate: UltimateTemplate
  ultimateEffects: UltimateEffect[]
}

export interface EnemyConfigDTO {
  configs: EnemyConfig[]
  weights: EnemySpawnInfo[]
}

export interface IEnemyConfigLoader {
  load(): Promise<EnemyConfigDTO>
}
