/**
 * Shared Effect System
 *
 * 共享的效果系統，可被戰鬥內外使用。
 *
 * 設計原則：
 * - 服務定位器模式，解耦 Effect 與具體實現
 * - 介面分離，戰鬥專屬功能透過擴展介面實現
 * - 無外部依賴（除了 domain/attribute 與 shared/attribute-system）
 * - 易於跨語言移植
 */
// 核心類別
export { EffectManager } from './EffectManager'
export { StackableEffect } from './models/stackable-effect'
// 介面定義
export type { IEffect } from './models/effect'
export type { IEffectLifeHook, ICharacterStateHook, ICombatEffectHook } from './models/effect-hooks'
export type { IEffectServices, ICombatEffectServices } from './models/effect-services'
export type { ICharacterFacade } from './models/character-facade'
