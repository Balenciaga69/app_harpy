import { BaseInstanceFields, WithCreatedAt } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { AffixInstance } from '../affix/models/AffixInstance'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateInstance } from '../ultimate/models/UltimateInstance'

export type EnemyRole = 'NORMAL' | 'ELITE' | 'BOSS'
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
