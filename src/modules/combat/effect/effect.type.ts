/** 效果類型列表 */
export type EffectType = 'holyFire' | 'poison' | 'chill' | 'charge' | 'blind'
/** 效果基本數據 */
export interface EffectData {
  id: string
  type: EffectType
  layers: number
  /** 效果應用的 tick 時刻 */
  appliedAt: number
  /** 效果過期時刻（-1 表示永不過期） */
  expireAt: number
  /** 該效果已影響的最大生命值（用於聖火永久增加） */
  maxHpIncreased?: number
}
/** 聖火效果配置 */
export interface HolyFireConfig {
  readonly healTickInterval: number // 每多少 tick 執行一次治療
  readonly healPercentMap: Record<number, number> // layers -> 治療百分比
  readonly damageBoostPercentMap: Record<number, number> // layers -> 火傷害提高百分比
  readonly maxHpIncreasePercentMap: Record<number, number> // layers -> 最大生命永久增加百分比
}
/** 中毒效果配置 */
export interface PoisonConfig {
  readonly damagePerLayerPerTick: number // 每層每 tick 的傷害
  readonly durationTicks: number // 單筆持續時間
}
/** 冰緩效果配置 */
export interface ChillConfig {
  readonly attackSpeedReductionPercent: number // 攻擊速度下降百分比
  readonly durationTicks: number // 持續時間
  readonly maxLayers: number // 最大疊加層數
}
/** 充能效果配置 */
export interface ChargeConfig {
  readonly attackSpeedBoostPercent: number // 攻擊速度提升百分比
  readonly durationTicks: number // 持續時間
  readonly maxLayers: number // 最大疊加層數
}
/** 致盲效果配置 */
export interface BlindConfig {
  readonly baseAccuracyReductionPercent: number // 命中率下降百分比
  readonly durationTicks: number // 持續時間
  readonly canStack: boolean // 是否可疊加
}
/** 所有效果配置的聯合類型 */
export type EffectConfig = HolyFireConfig | PoisonConfig | ChillConfig | ChargeConfig | BlindConfig
/** 效果修飾符（用於計算屬性） */
export interface EffectModifier {
  hpHealPercent: number
  attackSpeedPercent: number // 正值為加速，負值為減速
  damageBoostByType: Record<string, number> // 按傷害類型的傷害提高百分比
  accuracyReduction: number // 命中率下降百分比
  maxHpIncreasePercent: number
}
