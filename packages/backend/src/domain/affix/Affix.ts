import { BaseInstanceFields, WithCreatedInfo, WithSourceUnit } from '../../shared/models/BaseInstanceFields'
import { I18nField } from '../../shared/models/I18nField'
import { TagType } from '../../shared/models/TagType'
import { UnitStatModifier } from '../stats/models/StatModifier'
import { AffixEffect } from './effect/AffixEffectTemplate'
/** 詞綴記錄，包含詞綴的基本識別資訊與創建資訊 */
export interface AffixRecord extends BaseInstanceFields, WithSourceUnit, WithCreatedInfo {}
/** 詞綴樣板，定義詞綴的靜態屬性與綁定的效果集合 */
export interface AffixTemplate {
  readonly id: string
  readonly desc: I18nField
  readonly tags: ReadonlyArray<TagType>
  readonly effectIds: ReadonlyArray<string>
}
/** 詞綴聚合，包含詞綴記錄、樣板與效果集合 */
export class AffixAggregate {
  constructor(
    public readonly record: AffixRecord,
    public readonly template: AffixTemplate,
    public readonly effects: ReadonlyArray<AffixEffect>
  ) {}
  /** 取得裝備此詞綴時所帶來的單位屬性修改器集合 */
  getUnitStatModifiers(): UnitStatModifier[] {
    const { difficulty } = this.record.atCreated
    // 先篩選出 ON_EQUIP 的效果
    const onEquipEffects = this.effects.filter((effect) => effect.trigger === 'ON_EQUIP')
    // 取得所有 STAT_MODIFY 的 action
    const statModifyActions = onEquipEffects.flatMap((effect) =>
      effect.actions.filter((action) => action.type === 'STAT_MODIFY')
    )
    // 計算每個 action 的 UnitStatModifier
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
