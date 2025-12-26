import { BaseInstanceFields, WithCreatedAt, WithSourceUnit } from '../../shared/models/BaseInstanceFields'
export interface UltimateInstance extends BaseInstanceFields, WithSourceUnit, WithCreatedAt {
  readonly pluginIds: string[]
}
