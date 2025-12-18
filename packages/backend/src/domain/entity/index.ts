/**
 * TODO: 這一塊需要重新整理，等到要來製作戰鬥模組前會再來處理
 */
import { BaseInstanceFields, WithCreatedAt } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { AffixInstance } from '../affix/models/AffixInstance'
import { ItemInstance } from '../item/models/ItemInstance'
import { EquipmentSlot } from '../item/models/ItemTemplate'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateInstance } from '../ultimate/models/UltimateInstance'

export interface CharacterInstance {
  id: string
  professionId: string
  equipment: Map<EquipmentSlot, ItemInstance>
  relics: ItemInstance[]
  ultimateSkill: UltimateInstance
}

export interface CharacterTemplate {
  id: string
  staticStats: UnitStats
}

type EnemyRole = 'NORMAL' | 'ELITE' | 'BOSS'
export interface EnemyInstance extends BaseInstanceFields, WithCreatedAt {
  role: EnemyRole
  affixes: AffixInstance[]
  ultimateSkill: UltimateInstance
}

export interface EnemyRoleConfig {
  affixIds: string[]
  ultimateId: string
}

export interface EnemyTemplate {
  id: string
  name: I18nField
  desc: I18nField
  staticStats: UnitStats
  roleConfigs: Map<EnemyRole, EnemyRoleConfig>
}

export interface CreatureInstance extends BaseInstanceFields {
  summonerId: string
}

export interface CreatureTemplate {
  id: string
  name: I18nField
  desc: I18nField
  staticStats: UnitStats
  duration: number
}

// TODO: 將 Creature/Enemy/Character 轉成可以戰鬥的 Unit 介面
export const UnitGenerator = {}

export interface IUnit {
  id: string
  statSnapshot: UnitStats
  aliments: Map<string, string> // alimentId , layers
  affixes: AffixInstance[]
}

export interface WithUltimate {
  ultimate: UltimateInstance
}
