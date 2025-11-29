import type { DamageType } from '../shared/types/stats.type'
import type { EffectType } from '../effect/effect.type'
/**
 * 角色狀態快照（用於回放）
 */
export interface CharacterSnapshot {
  hp: number
  maxHp: number
  armor: number
  evasion: number
  effects: Array<{
    type: string
    layers: number
  }>
}
/**
 * 日誌基礎結構
 */
type BaseCombatLog = {
  tick: number
  snapshot?: Record<string, CharacterSnapshot>
}
/**
 * 攻擊日誌
 */
export type AttackLog = BaseCombatLog & {
  type: 'attack'
  actorId: string
  targetId: string
}
/**
 * 閃避日誌
 */
export type AttackDodgeLog = BaseCombatLog & {
  type: 'attack_dodge'
  actorId: string
  targetId: string
}
/**
 * 未命中日誌
 */
export type AttackMissLog = BaseCombatLog & {
  type: 'attack_miss'
  actorId: string
  targetId: string
}
/**
 * 傷害日誌
 */
export type DamageLog = BaseCombatLog & {
  type: 'damage'
  actorId: string
  value: number
  detail: {
    damageType: DamageType
    rawDamage: number
    reducedDamage: number
  }
}
/**
 * 治療日誌
 */
export type HealLog = BaseCombatLog & {
  type: 'heal'
  actorId: string
  value: number
  detail: {
    source: 'holyFire' | 'potion' | 'other'
  }
}
/**
 * 死亡日誌
 */
export type DeathLog = BaseCombatLog & {
  type: 'death'
  actorId: string
}
/**
 * 效果應用日誌
 */
export type EffectApplyLog = BaseCombatLog & {
  type: 'effect_apply'
  actorId: string
  value: number
  detail: {
    effectType: EffectType
    durationTicks: number
  }
}
/**
 * 效果過期日誌
 */
export type EffectExpireLog = BaseCombatLog & {
  type: 'effect_expire'
  actorId: string
  detail: {
    effectType: EffectType
    effectId: string
  }
}
/**
 * 效果 tick 日誌
 */
export type EffectTickLog = BaseCombatLog & {
  type: 'effect_tick'
  actorId: string
  value?: number
  detail: {
    effectType: EffectType
    effectId: string
    layers: number
  }
}
/**
 * 戰鬥日誌聯合型別 - 使用 discriminated union 提供強型別約束
 */
export type CombatLog =
  | AttackLog
  | AttackDodgeLog
  | AttackMissLog
  | DamageLog
  | HealLog
  | DeathLog
  | EffectApplyLog
  | EffectExpireLog
  | EffectTickLog
