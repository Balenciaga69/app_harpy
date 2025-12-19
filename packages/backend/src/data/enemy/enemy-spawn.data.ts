import { EnemySpawnInfo } from './interfaces'

export const EnemyWeightList: EnemySpawnInfo[] = [
  { templateId: '獵手', weight: 10, chapters: [1] },
  { templateId: '忍者', weight: 10, chapters: [2] },
  { templateId: '巫醫', weight: 10, chapters: [3] },
  { templateId: '稀有泰坦', weight: 1, chapters: [1, 2, 3] },
]
