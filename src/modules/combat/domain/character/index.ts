// 公共類（給外部使用）
export { Character } from './character'

// 角色模板工廠函數（給外部使用）
export {
  createWarriorTemplate,
  createArcherTemplate,
  createMageTemplate,
  createAssassinTemplate,
  createTankTemplate,
  createMinionTemplate,
  createEliteTemplate,
  createBossTemplate,
  createBalancedTemplate,
} from './character.templates'

// 公共接口（類型定義）
export type { ICharacter, CharacterId, CharacterSnapshot } from './interfaces/character.interface'
export type { IAttributeProvider } from './interfaces/attribute.provider.interface'
export type { IEffectOwner } from './interfaces/effect.owner.interface'
export type { IUltimateOwner } from './interfaces/ultimate.owner.interface'

// 公共類型（屬性相關）
export type { AttributeType } from './models/attribute.core.model'
export type { AttributeModifier } from './models/attribute.modifier.model'
export type { BaseAttributeValues } from './models/attribute.core.model'

// 注意：AttributeContainer 和 AttributeCalculator 是內部實現，不導出
// 注意：EffectManager 也是內部實現，不導出
