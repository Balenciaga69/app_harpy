export interface IEnemyGenerationConfig {
  difficulty: number
  seed?: string
  enemyCount: number
  allowedEnemyIds?: string[]
  minThreatLevel?: number
  maxThreatLevel?: number
  classPreferences?: Record<string, number>
}
