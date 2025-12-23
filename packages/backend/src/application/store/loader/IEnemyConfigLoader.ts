import { AffixTemplate } from '../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../domain/affix/effect/AffixEffectTemplate'
import { EnemySpawnInfo, EnemyTemplate } from '../../../domain/entity/Enemy'
import { UltimateTemplate } from '../../../domain/ultimate/UltimateTemplate'

export interface EnemyConfig {
  enemyTemplate: EnemyTemplate
  affixTemplates: AffixTemplate[]
  affixEffects: AffixEffectTemplate[]
  ultimateTemplate: UltimateTemplate[]
}

export interface EnemyConfigDTO {
  configs: EnemyConfig[]
  spawnInfos: EnemySpawnInfo[]
}

export interface IEnemyConfigLoader {
  load(): Promise<EnemyConfigDTO>
}
