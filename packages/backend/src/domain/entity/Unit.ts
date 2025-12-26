/**
 * TODO: 這一塊需要重新整理, 等到要來製作戰鬥模組前會再來處理
 */
import { AffixInstance } from '../affix/AffixInstance'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateInstance } from '../ultimate/UltimateInstance'

// TODO: 將 Creature/Enemy/Character 轉成可以戰鬥的 Unit 介面

/** 單位在戰鬥中的實時狀態快照，包含統計值、異常與綁定的效果 */
export const UnitGenerator = {}

/** 戰鬥單位介面，提供統計、異常與詞綴的統一視圖 */
export interface IUnit {
  id: string
  statSnapshot: UnitStats
  ailments: Map<string, string> // alimentId , layers
  affixes: AffixInstance[]
}

/** 擁有大絕招的單位的擴展介面 */
export interface WithUltimate {
  ultimate: UltimateInstance
}
