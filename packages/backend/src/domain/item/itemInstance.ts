import { BaseInstanceFields, WithCreatedAt } from '../../shared/models/BaseInstanceFields'
import { AffixInstance } from '../affix/AffixInstance'

export interface ItemInstance extends BaseInstanceFields, WithCreatedAt {
  readonly affixInstances: AffixInstance[]
}

export interface RelicInstance extends ItemInstance, WithCreatedAt {
  readonly currentStacks: number
}
