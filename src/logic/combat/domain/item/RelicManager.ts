import type { ICharacter } from '../character/models/character'
import type { ICombatContext } from '@/logic/combat/context'
import type { ICombatRelic } from './models/combat-item'
/**
 * RelicManager
 *
 * 管理角色的遺物。
 * 遺物以 name 為 key，同名遺物會增加堆疊數。
 * 效果會隨堆疊數變化而重新計算。
 */
export class RelicManager {
  private readonly relics = new Map<string, ICombatRelic>()
  private readonly owner: ICharacter
  constructor(owner: ICharacter) {
    this.owner = owner
  }
  /** 添加遺物，同名遺物會更新（呼叫方需提供新的堆疊效果） */
  add(relic: ICombatRelic, context: ICombatContext): void {
    const existingRelic = this.relics.get(relic.name)
    if (existingRelic) {
      // 移除舊效果
      for (const effect of existingRelic.effects) {
        this.owner.removeEffect(effect.id, context)
      }
    }
    // 註冊新遺物（含更新後的堆疊數與效果）
    this.relics.set(relic.name, relic)
    // 應用新效果
    for (const effect of relic.effects) {
      this.owner.addEffect(effect, context)
    }
  }
  /** 移除遺物（所有堆疊） */
  remove(relicName: string, context: ICombatContext): void {
    const relic = this.relics.get(relicName)
    if (!relic) return
    for (const effect of relic.effects) {
      this.owner.removeEffect(effect.id, context)
    }
    this.relics.delete(relicName)
  }
  /** 取得指定名稱的遺物 */
  getRelic(relicName: string): ICombatRelic | undefined {
    return this.relics.get(relicName)
  }
  /** 取得所有遺物 */
  getAllRelics(): ICombatRelic[] {
    return Array.from(this.relics.values())
  }
  /** 檢查是否擁有指定遺物 */
  hasRelic(relicName: string): boolean {
    return this.relics.has(relicName)
  }
  /** 取得遺物的堆疊數 */
  getStackCount(relicName: string): number {
    return this.relics.get(relicName)?.stackCount ?? 0
  }
  /** 清除所有遺物 */
  clear(context: ICombatContext): void {
    const relicNames = Array.from(this.relics.keys())
    for (const name of relicNames) {
      this.remove(name, context)
    }
  }
}
