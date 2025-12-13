// App layer exports
export { EffectManager } from './app/EffectManager'
export { EffectBuilder } from './app/builders/EffectBuilder'
export { ClassEffectRegistry } from './app/builders/ClassEffectRegistry'
export { StaticEffectGenerator } from './app/builders/StaticEffectGenerator'
export { registerDefaultClassEffects } from './app/builders/RegisterDefaultEffects'
// Domain layer exports
export {
  EffectBuilderError,
  UnknownEffectTemplateError,
  InvalidStaticEffectError,
  ClassNotRegisteredError,
} from './domain/errors/EffectBuilderError'
// Interfaces exports
export type { IEffect } from './interfaces/IEffect'
export type { IEffectServices, ICombatEffectServices } from './interfaces/IEffectServices'
export type { ICharacterFacade } from './interfaces/ICharacterFacade'
export type { EffectConstructor } from './interfaces/IEffectConstructor'
export type { IEffectLifeHook, ICharacterStateHook, ICombatEffectHook } from './interfaces/IEffectHooks'
export { StaticAttributeEffect } from './interfaces/IStaticAttributeEffect'
export { StackableEffect } from './interfaces/IStackableEffect'
