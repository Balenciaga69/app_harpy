 這一塊需要重新整理, 等到要來製作戰鬥模組前會再來TODO:處理
 TODO: 將 Creature/Enemy/Character 轉成可以戰鬥的 Unit 介面
import { AffixRecord } from '../affix/Affix'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateRecord } from '../ultimate/Ultimate'
export const UnitGenerator = {}
export interface IUnit {
  id: string
  statSnapshot: UnitStats
  ailments: Map<string, string> // alimentId , layers
  affixes: AffixRecord[]
}
export interface WithUltimate {
  ultimate: UltimateRecord
}
