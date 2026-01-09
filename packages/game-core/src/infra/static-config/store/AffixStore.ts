import { IAffixStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
import { ConfigNotFoundError } from '../../../shared/errors/GameErrors'

export class AffixStore implements IAffixStore {
  private readonly affixes: Map<string, AffixTemplate> = new Map()
  private readonly affixEffects: Map<string, AffixEffect> = new Map()

  getAffixes(ids: string[]): AffixTemplate[] {
    return ids.map((e) => this.getAffix(e))
  }

  getAffixEffects(ids: string[]): AffixEffect[] {
    return ids.map((e) => this.getAffixEffect(e))
  }

  getAffix(id: string): AffixTemplate {
    const affix = this.affixes.get(id)
    if (!affix) {
      throw new ConfigNotFoundError('AffixTemplate', id)
    }
    return affix
  }

  hasAffix(id: string): boolean {
    return this.affixes.has(id)
  }

  getAffixEffect(id: string): AffixEffect {
    const effect = this.affixEffects.get(id)
    if (!effect) {
      throw new ConfigNotFoundError('AffixEffect', id)
    }
    return effect
  }

  hasAffixEffect(id: string): boolean {
    return this.affixEffects.has(id)
  }

  setMany(affixes: AffixTemplate[]): void {
    for (const affix of affixes) {
      this.affixes.set(affix.id, affix)
    }
  }

  setAffixEffects(effects: AffixEffect[]): void {
    for (const effect of effects) {
      this.affixEffects.set(effect.id, effect)
    }
  }
}
