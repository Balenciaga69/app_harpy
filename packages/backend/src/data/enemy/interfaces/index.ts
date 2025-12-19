import { AffixTemplate } from '../../../domain/affix/AffixTemplate'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffect'
import { EnemyTemplate } from '../../../domain/entity/Enemy/Enemy'
import { UltimateEffect } from '../../../domain/ultimate/UltimateEffect'
import { UltimateTemplate } from '../../../domain/ultimate/UltimateTemplate'

export interface EnemyTemplatePackage {
  enemyTemplate: EnemyTemplate
  affixTemplates: AffixTemplate[]
  affixEffects: AffixEffect[]
  ultimateTemplate: UltimateTemplate
  ultimateEffects: UltimateEffect[]
}

export interface EnemySpawnInfo {
  readonly templateId: string
  readonly weight: number
  readonly chapters: Array<1 | 2 | 3>
}
