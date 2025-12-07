/**
 * Domain - Character Module
 *
 * 角色系統的共享定義層。
 * 包含角色定義、職業定義與註冊表。
 */
export type { ICharacterDefinition, IClassDefinition } from './definitions'
export { CharacterDefinitionRegistry, ClassDefinitionRegistry } from './registries'
export { CharacterError } from './errors'
