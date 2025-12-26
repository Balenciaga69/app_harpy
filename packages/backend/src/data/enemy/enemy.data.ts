import { EnemySpawnInfo, EnemyTemplate } from '../../domain/entity/Enemy'
import { enemy_template_chemist } from './templates/chemist-enemy.data'
export const EnemyWeightList: EnemySpawnInfo[] = [
  { templateId: enemy_template_chemist.id, weight: 100, chapters: [1, 2, 3] },
]
export const EnemyTemplateList: EnemyTemplate[] = [enemy_template_chemist]
