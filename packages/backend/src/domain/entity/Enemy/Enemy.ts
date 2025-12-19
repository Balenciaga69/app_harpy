import { BaseInstanceFields, WithCreatedAt } from '../../../shared/models/BaseInstanceFields'
import { I18nField } from '../../../shared/models/I18nField'
import { AffixInstance } from '../../affix/AffixInstance'
import { UltimateInstance } from '../../ultimate/UltimateInstance'

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
  roleConfigs: Record<EnemyRole, EnemyRoleConfig>
}
