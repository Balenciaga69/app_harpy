/**
 * Effect 介面（相容層）
 *
 * @deprecated 請直接從 @/shared/effect-system import
 * 此檔案僅作為向後相容，避免破壞現有代碼。
 */
// 重新導出共享 Effect 系統
export type { IEffect } from '@/shared/effect-system'
export type { IEffectLifeHook, ICharacterStateHook } from '@/shared/effect-system'
// 戰鬥專屬 Hook（保留在 Combat 模組）
export type { ICombatEffectHook } from '@/shared/effect-system'
