import { BaseInstanceFields, WithCreatedInfo, WithSourceUnit } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UnitStatModifier } from '../stats/models/StatModifier'
import { AffixEffect } from './effect/AffixEffectTemplate'
export interface AffixRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {}
export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: ReadonlyArray<TagType>
  readonly effectIds: ReadonlyArray<string>
}
export class AffixEntity {
  constructor(
    public readonly record: AffixRecord,
    public readonly template: AffixTemplate,
    public readonly effects: ReadonlyArray<AffixEffect>
  ) {}
  getUnitStatModifiers(): UnitStatModifier[] {
    const { difficulty } = this.record.atCreated
    const onEquipEffects = this.effects.filter((effect) => effect.trigger === 'ON_EQUIP')
    const statModifyActions = onEquipEffects.flatMap((effect) =>
      effect.actions.filter((action) => action.type === 'STAT_MODIFY')
    )
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
