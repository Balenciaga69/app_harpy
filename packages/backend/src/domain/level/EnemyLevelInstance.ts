import { EnemyInstance } from '../entity/Enemy/Enemy'

export interface EnemyLevelInstance {
  id: string
  type: 'ELITE' | 'BOSS' | 'NORMAL'
  enemy: EnemyInstance
}
