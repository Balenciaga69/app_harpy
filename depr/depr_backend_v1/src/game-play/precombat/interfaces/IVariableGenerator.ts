import type { IPreCombatVariable } from './IPreCombatVariable'
import type { IEncounterContext } from './IEncounterContext'

/**
 * 變數生成器配置
 */
export interface IVariableGeneratorConfig {
  /** 隨機種子 */
  seed: string | number
  /** 遭遇戰上下文 */
  encounterContext: IEncounterContext
  /** 變數數量範圍 [min, max] */
  variableCountRange: [number, number]
}

/**
 * 變數生成器介面
 *
 * 根據 seed 與難度生成候選 PreCombatVariable
 */
export interface IVariableGenerator {
  /**
   * 生成賽前變數
   * @param config 生成配置
   * @returns 生成的變數列表
   */
  generate(config: IVariableGeneratorConfig): IPreCombatVariable[]
}
