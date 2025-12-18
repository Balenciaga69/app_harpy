/**
 * TODO: 這一塊需要重新整理，等到要來製作戰鬥模組前會再來處理
 */
import { AffixInstance } from '../affix/models/AffixInstance'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateInstance } from '../ultimate/models/UltimateInstance'

// TODO: 將 Creature/Enemy/Character 轉成可以戰鬥的 Unit 介面
export const UnitGenerator = {}

export interface IUnit {
  id: string
  statSnapshot: UnitStats
  aliments: Map<string, string> // alimentId , layers
  affixes: AffixInstance[]
}

export interface WithUltimate {
  ultimate: UltimateInstance
}
