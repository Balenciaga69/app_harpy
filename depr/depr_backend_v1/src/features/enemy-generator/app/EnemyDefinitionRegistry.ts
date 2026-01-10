import type { IEnemyDefinition, IEnemyDefinitionRegistry } from '../interfaces'

export class EnemyDefinitionRegistry implements IEnemyDefinitionRegistry {
  private readonly definitions: Map<string, IEnemyDefinition>

  constructor() {
    this.definitions = new Map()
  }

  register(definition: IEnemyDefinition): void {
    this.definitions.set(definition.id, definition)
  }

  get(id: string): IEnemyDefinition | undefined {
    return this.definitions.get(id)
  }

  getAll(): IEnemyDefinition[] {
    return Array.from(this.definitions.values())
  }

  getByThreatLevel(min: number, max: number): IEnemyDefinition[] {
    return this.getAll().filter(
      (def) => def.threatLevel >= min && def.threatLevel <= max,
    )
  }

  getByClassId(classId: string): IEnemyDefinition[] {
    return this.getAll().filter((def) => def.classId === classId)
  }
}
