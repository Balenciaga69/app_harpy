import { BaseInstanceFields, WithCreatedInfo, WithSourceUnit } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UnitStatModifier } from '../stats/models/StatModifier'
import { AffixEffect } from './effect/AffixEffectTemplate'
/** Affix record, including basic identification information and creation information of the affix */
export interface AffixRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {}
/** Affix template, defining the static properties of the affix and the set of bound effects */
export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: ReadonlyArray<TagType>
  readonly effectIds: ReadonlyArray<string>
}
/** Affix entity, including affix records, templates, and effect sets */
export class AffixEntity {
  constructor(
    public readonly record: AffixRecord,
    public readonly template: AffixTemplate,
    public readonly effects: ReadonlyArray<AffixEffect>
  ) {}
  /** Get the set of unit attribute modifiers provided when this affix is equipped. */
  getUnitStatModifiers(): UnitStatModifier[] {
    const { difficulty } = this.record.atCreated
    // First, filter out the effects of ON_EQUIP.
    const onEquipEffects = this.effects.filter((effect) => effect.trigger === 'ON_EQUIP')
    // Get all STAT_MODIFY actions
    const statModifyActions = onEquipEffects.flatMap((effect) =>
      effect.actions.filter((action) => action.type === 'STAT_MODIFY')
    )
    // Calculate the UnitStatModifier for each action
    const unitStatModifiers = statModifyActions.map((statModifyEffect) => {
      const computedAffixMultiplier =
        !!statModifyEffect.affixMultiplier && statModifyEffect.affixMultiplier > 0
          ? statModifyEffect.affixMultiplier * difficulty
          : 1
      return {
        field: statModifyEffect.stat,
        operation: statModifyEffect.operation,
        value: statModifyEffect.value * computedAffixMultiplier,
      } as UnitStatModifier
    })
    return unitStatModifiers
  }
}
