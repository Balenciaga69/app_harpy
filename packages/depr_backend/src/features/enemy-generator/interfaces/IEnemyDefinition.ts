export interface IEnemyDefinition {
  readonly id: string
  readonly name: string
  readonly classId: string
  readonly levelRange: { min: number; max: number }
  readonly threatLevel: number
  readonly tags: string[]
}
