/** 傷害類型 */
export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison'
/** 傷害數據 */
export interface DamageData {
  type: DamageType
  amount: number
}
/** 武器屬性 */
export interface WeaponStats {
  damages: DamageData[]
  accuracy: number
  criticalChance: number
  cooldown: number
  strategyIds: string[]
}
/** 裝備屬性 */
export interface GearStats {
  hp: number
  evasion: number
  armor: number
  strategyIds: string[]
}
/** 角色完整屬性 */
export interface CharacterStats {
  hp: number
  evasion: number
  armor: number
  gears: GearStats[]
  weapon?: WeaponStats
}
