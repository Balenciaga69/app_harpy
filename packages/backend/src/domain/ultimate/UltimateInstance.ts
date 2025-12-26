import { BaseInstanceFields, WithCreatedAt, WithSourceUnit } from '../../shared/models/BaseInstanceFields'

/** 大絕招實例，代表單位擁有的特定大絕招與其綁定的插件 */
export interface UltimateInstance extends BaseInstanceFields, WithSourceUnit, WithCreatedAt {
  readonly pluginIds: string[]
}
