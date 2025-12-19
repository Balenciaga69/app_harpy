import { EnemySpawnInfo, EnemyTemplatePackage } from './interfaces'
import { chemist_package } from './templates/chemist-package'

export const EnemyWeightList: EnemySpawnInfo[] = [
  { templateId: chemist_package.enemyTemplate.id, weight: 100, chapters: [1, 2, 3] },
]

export const EnemyTemplates: EnemyTemplatePackage[] = [chemist_package]
