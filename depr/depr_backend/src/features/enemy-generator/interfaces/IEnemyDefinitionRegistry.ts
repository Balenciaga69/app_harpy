import type { IEnemyDefinition } from './IEnemyDefinition'

export interface IEnemyDefinitionRegistry {
  register(definition: IEnemyDefinition): void
  get(id: string): IEnemyDefinition | undefined
  getAll(): IEnemyDefinition[]
  getByThreatLevel(min: number, max: number): IEnemyDefinition[]
  getByClassId(classId: string): IEnemyDefinition[]
}
