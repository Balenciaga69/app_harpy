import type { IEnemyGenerationConfig } from './IEnemyGenerationConfig'
import type { IEnemyInstance } from './IEnemyInstance'

export interface IEnemyGenerator {
  generateEnemies(config: IEnemyGenerationConfig): Promise<IEnemyInstance[]>
}
