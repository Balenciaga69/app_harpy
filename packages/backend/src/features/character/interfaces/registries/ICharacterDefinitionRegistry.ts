import { ICharacterDefinition } from '../definitions/ICharacterDefinition'

/**
 * ICharacterDefinitionRegistry
 *
 * Interface for managing character definitions.
 */
export interface ICharacterDefinitionRegistry {
  /** Register a character definition */
  register(definition: ICharacterDefinition): void

  /** Register multiple character definitions */
  registerMany(definitions: ICharacterDefinition[]): void

  /** Get a character definition by ID */
  get(id: string): ICharacterDefinition | undefined

  /** Get all character definitions by class ID */
  getByClass(classId: string): ICharacterDefinition[]

  /** Get all character definitions */
  getAll(): ICharacterDefinition[]

  /** Check if a character definition exists by ID */
  has(id: string): boolean

  /** Clear all registered character definitions */
  clear(): void

  /** Get the count of registered character definitions */
  readonly count: number
}
