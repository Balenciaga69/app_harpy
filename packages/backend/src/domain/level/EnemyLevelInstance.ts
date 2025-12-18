import { EnemyInstance } from '../entity/Enemy'

export interface EnemyLevelInstance {
  id: string
  type: 'ELITE' | 'BOSS' | 'NORMAL'
  enemy: EnemyInstance
}
