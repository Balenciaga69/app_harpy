import { BaseInstanceFields, WithCreatedAt, WithSourceUnit } from '../../shared/models/BaseInstanceFields'

/** 最終技能實例，代表單位擁有的特定最終技能與其綁定的插件 */
export interface UltimateInstance extends BaseInstanceFields, WithSourceUnit, WithCreatedAt {
  readonly pluginIds: string[]
}
