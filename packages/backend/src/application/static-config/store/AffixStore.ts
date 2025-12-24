import { AffixTemplate } from '../../../domain/affix/AffixTemplate'
import { AffixEffectTemplate } from '../../../domain/affix/effect/AffixEffectTemplate'
import { IAffixStore } from './IConfigStores'

export class AffixStore implements IAffixStore {
  private affixes: Map<string, AffixTemplate> = new Map()
  private affixEffects: Map<string, AffixEffectTemplate> = new Map()

  getAffix(id: string): AffixTemplate | undefined {
    return this.affixes.get(id)
  }

  hasAffix(id: string): boolean {
    return this.affixes.has(id)
  }

  getAffixEffect(id: string): AffixEffectTemplate | undefined {
    return this.affixEffects.get(id)
  }

  hasAffixEffect(id: string): boolean {
    return this.affixEffects.has(id)
  }

  setMany(affixes: AffixTemplate[]): void {
    for (const affix of affixes) {
      this.affixes.set(affix.id, affix)
    }
  }

  setAffixEffects(effects: AffixEffectTemplate[]): void {
    for (const effect of effects) {
      this.affixEffects.set(effect.id, effect)
    }
  }
}
