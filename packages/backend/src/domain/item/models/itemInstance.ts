import { BaseInstanceFields } from '../../../shared/models/BaseInstanceFields'
import { AffixInstance } from '../../affix/models/AffixInstance'
import { EquipmentSlot } from './ItemTemplate'

export interface ItemInstance extends BaseInstanceFields {
  readonly affixInstances: AffixInstance[]
}

export interface EquipmentInstance extends ItemInstance {
  readonly slot: EquipmentSlot
}

export interface RelicInstance extends ItemInstance {
  readonly currentStacks: number
}
