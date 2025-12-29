import { IAffixStore } from '../../../application/core-infrastructure/static-config/IConfigStores'
import { AffixTemplate } from '../../../domain/affix/Affix'
import { AffixEffect } from '../../../domain/affix/effect/AffixEffectTemplate'
/** 詞綴配置存儲：管理詞綴樣板與詞綴效果樣板 */
export class AffixStore implements IAffixStore {
  private readonly affixes: Map<string, AffixTemplate> = new Map()
  private readonly affixEffects: Map<string, AffixEffect> = new Map()
  /** 根據多個 ID 查詢詞綴樣板 */
  getAffixes(ids: string[]): AffixTemplate[] {
    return ids.map((e) => this.getAffix(e)).filter((a): a is AffixTemplate => !!a)
  }
  /** 根據多個 ID 查詢詞綴效果樣板 */
  getAffixEffects(ids: string[]): AffixEffect[] {
    return ids.map((e) => this.getAffixEffect(e)).filter((a): a is AffixEffect => !!a)
  }
  /** 根據 ID 查詢詞綴樣板 */
  getAffix(id: string): AffixTemplate | undefined {
    return this.affixes.get(id)
  }
  /** 檢查詞綴樣板是否存在 */
  hasAffix(id: string): boolean {
    return this.affixes.has(id)
  }
  /** 根據 ID 查詢詞綴效果樣板 */
  getAffixEffect(id: string): AffixEffect | undefined {
    return this.affixEffects.get(id)
  }
  /** 檢查詞綴效果樣板是否存在 */
  hasAffixEffect(id: string): boolean {
    return this.affixEffects.has(id)
  }
  /** 批量存儲詞綴樣板 */
  setMany(affixes: AffixTemplate[]): void {
    for (const affix of affixes) {
      this.affixes.set(affix.id, affix)
    }
  }
  /** 批量存儲詞綴效果樣板 */
  setAffixEffects(effects: AffixEffect[]): void {
    for (const effect of effects) {
      this.affixEffects.set(effect.id, effect)
    }
  }
}
