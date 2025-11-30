import type { ICharacter } from '../../character'
import type { DamageEvent } from '../../damage'
/**
 * DamageFactory：傷害事件創建工廠。
 *
 * 設計理念：
 * - v0.3 簡化版本：移除元素傷害系統，統一為純粹傷害
 * - 支援普通攻擊與大招兩種傷害類型
 * - 支援真實傷害（無視防禦）標記
 * - 提供統一的 DamageEvent 結構
 *
 * 主要職責：
 * - 創建標準攻擊的傷害事件（從 attackDamage 屬性取值）
 * - 創建大招的傷害事件（isUltimate = true）
 * - 創建真實傷害事件（isTrueDamage = true，無視任何減免）
 * - 初始化傷害事件的預設狀態
 */
export class DamageFactory {
  /** 創建普通攻擊傷害事件 */
  createAttackEvent(source: ICharacter, target: ICharacter, tick: number): DamageEvent {
    const baseDamage = source.getAttribute('attackDamage') ?? 0
    return {
      source,
      target,
      amount: baseDamage,
      finalDamage: 0,
      isCrit: false,
      isHit: true,
      isUltimate: false,
      isTrueDamage: false,
      tick,
      prevented: false,
    }
  }
  /** 創建大招傷害事件 */
  createUltimateEvent(source: ICharacter, target: ICharacter, damageAmount: number, tick: number): DamageEvent {
    return {
      source,
      target,
      amount: damageAmount,
      finalDamage: 0,
      isCrit: false,
      isHit: true,
      isUltimate: true,
      isTrueDamage: false,
      tick,
      prevented: false,
    }
  }
  /** 創建真實傷害事件（無視防禦） */
  createTrueDamageEvent(source: ICharacter, target: ICharacter, damageAmount: number, tick: number): DamageEvent {
    return {
      source,
      target,
      amount: damageAmount,
      finalDamage: damageAmount, // 真實傷害直接等於最終傷害
      isCrit: false,
      isHit: true,
      isUltimate: false,
      isTrueDamage: true,
      tick,
      prevented: false,
    }
  }
}
