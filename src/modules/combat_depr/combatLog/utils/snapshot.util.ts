import type { Character } from '../../character/character.model'
import type { CharacterSnapshot } from '../combatLog.type'
/**
 * 角色快照工具
 * 用於記錄和還原角色狀態
 */
export class SnapshotHelper {
  /** 創建角色快照 */
  static createSnapshot(character: Character): CharacterSnapshot {
    return {
      hp: character.stats.hp,
      maxHp: character.getTotalHp(),
      armor: character.getTotalArmor(),
      evasion: character.getTotalEvasion(),
      effects: character
        .getEffectManager()
        .getAllEffects()
        .map((effect) => ({
          type: effect.type,
          layers: effect.layers,
        })),
    }
  }
  /** 判斷事件類型是否需要記錄 snapshot */
  static shouldRecordSnapshot(eventType: string): boolean {
    // 只在「狀態變化」事件記錄 snapshot
    const snapshotEvents = ['damage', 'heal', 'effect_apply', 'death']
    return snapshotEvents.includes(eventType)
  }
  /** 創建多個角色的 snapshot map */
  static createSnapshotMap(characters: Map<string, Character>): Record<string, CharacterSnapshot> {
    const snapshots: Record<string, CharacterSnapshot> = {}
    characters.forEach((character, id) => {
      snapshots[id] = this.createSnapshot(character)
    })
    return snapshots
  }
  /** 創建單個角色的 snapshot map（用於只影響一個角色的事件） */
  static createSingleSnapshot(characterId: string, character: Character): Record<string, CharacterSnapshot> {
    return {
      [characterId]: this.createSnapshot(character),
    }
  }
}
