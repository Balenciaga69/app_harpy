import { IClassDefinition } from '../definitions/IClassDefinition'
/**
 * IClassDefinitionRegistry
 *
 * Interface for managing class definitions.
 */
export interface IClassDefinitionRegistry {
  /** Register a class definition */
  register(definition: IClassDefinition): void
  /** Register multiple class definitions */
  registerMany(definitions: IClassDefinition[]): void
  /** Get a class definition by ID */
  get(id: string): IClassDefinition | undefined
  /** Get all class definitions */
  getAll(): IClassDefinition[]
  /** Check if a class definition exists by ID */
  has(id: string): boolean
  /** Clear all registered class definitions */
  clear(): void
  /** Get the count of registered class definitions */
  readonly count: number
}
