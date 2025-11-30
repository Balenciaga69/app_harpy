import type { ICharacter } from '../../character/interfaces/character.interface'
import { createEmptyDamages, type DamageEvent } from '../../damage/models/damage.event.model'
import { AttackType, type AttackTypeValue } from '../models/attack.type.model'
/**
 * DamageFactory：傷害事件創建工廠。
 *
 * 設計理念：
 * - 採用工廠模式集中化傷害事件的創建邏輯，避免在多處重複 switch-case。
 * - 根據攻擊類型自動分配對應的傷害類型（物理、火焰、冰霜等）與標籤。
 * - 提供統一的 DamageEvent 結構，確保傷害數據格式一致性。
 * - 支援多種攻擊類型擴展，新增攻擊方式只需添加新的 case 分支。
 *
 * 主要職責：
 * - 根據 AttackType 創建對應的 DamageEvent 物件。
 * - 從攻擊者屬性中提取基礎傷害值（attackDamage 或 spellDamage）。
 * - 設定傷害分配（damages 物件中的 physical、fire、ice 等欄位）。
 * - 添加對應的標籤（tags）以標記攻擊特性（melee、ranged、spell 等）。
 * - 初始化傷害事件的預設狀態（isHit、isCrit、evaded、prevented 等）。
 *
 * TODO: 這一塊爭議很大，可能需要重新設計(遊戲機致問題)
 */
export class DamageFactory {
  /**
   * 根據攻擊類型創建傷害事件
   */
  createDamageEvent(source: ICharacter, target: ICharacter, attackType: AttackTypeValue, tick: number): DamageEvent {
    const damages = createEmptyDamages()
    const tags = new Set<string>()
    switch (attackType) {
      case AttackType.MeleePhysical: {
        const baseDamage = source.getAttribute('attackDamage') ?? 0
        damages.physical = baseDamage
        tags.add('attack')
        tags.add('melee')
        tags.add('physical')
        break
      }
      case AttackType.RangedPhysical: {
        const baseDamage = source.getAttribute('attackDamage') ?? 0
        damages.physical = baseDamage
        tags.add('attack')
        tags.add('ranged')
        tags.add('physical')
        break
      }
      case AttackType.FireSpell: {
        const spellDamage = source.getAttribute('spellDamage') ?? 0
        damages.fire = spellDamage
        tags.add('spell')
        tags.add('fire')
        break
      }
      case AttackType.IceSpell: {
        const spellDamage = source.getAttribute('spellDamage') ?? 0
        damages.ice = spellDamage
        tags.add('spell')
        tags.add('ice')
        break
      }
      case AttackType.LightningSpell: {
        const spellDamage = source.getAttribute('spellDamage') ?? 0
        damages.lightning = spellDamage
        tags.add('spell')
        tags.add('lightning')
        break
      }
      case AttackType.PoisonSpell: {
        const spellDamage = source.getAttribute('spellDamage') ?? 0
        damages.poison = spellDamage
        tags.add('spell')
        tags.add('poison')
        break
      }
    }
    return {
      source,
      target,
      damages,
      finalDamage: 0,
      tags,
      isCrit: false,
      isHit: true,
      evaded: false,
      tick,
      prevented: false,
    }
  }
}
