import { EnemyInstance } from '../../domain/entity/Enemy'

type LevelType = 'NORMAL' | 'ELITE' | 'BOSS' | 'EVENT'

const IsBoss = (level: number): boolean => level % 10 === 0

const IsElite = (level: number): boolean => level % 5 === 0 && !IsBoss(level)

// TODO: LevelTemplate LevelInstance LevelNode LevelRule
export interface EnemyLevel {
  id: string
  type: 'ELITE' | 'BOSS' | 'EVENT'
  enemy: EnemyInstance
}

export interface EventLevel {
  id: string
  // Event ... 還在構思
}
