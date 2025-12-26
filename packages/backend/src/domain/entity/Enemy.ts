import { BaseInstanceFields, WithCreatedAt } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TemplateWeightInfo, WithChapter } from '../../shared/models/TemplateWeightInfo'
import { AffixInstance } from '../affix/AffixInstance'
import { UltimateInstance } from '../ultimate/UltimateInstance'

/** 敵人難度角色，決定敵人的詞綴與最終技能配置 */
export type EnemyRole = 'NORMAL' | 'ELITE' | 'BOSS'

/** 敵人實例，代表戰鬥中的特定敵人，包含所有詞綴與最終技能 */
export interface EnemyInstance extends BaseInstanceFields, WithCreatedAt {
  role: EnemyRole
  affixes: AffixInstance[]
  ultimateSkill: UltimateInstance
}

/** 敵人難度配置，定義不同難度敵人的詞綴與最終技能集合 */
export interface EnemyRoleConfig {
  affixIds: string[]
  ultimateId: string
}

/** 敵人樣板，定義敵人的靜態屬性與根據難度的配置 */
export interface EnemyTemplate {
  id: string
  name: I18nField
  desc: I18nField
  roleConfigs: Record<EnemyRole, EnemyRoleConfig>
}

/** 敵人生成信息，描述敵人出現的權重與進度約束 */
export interface EnemySpawnInfo extends TemplateWeightInfo, WithChapter {}
