import { nanoid } from 'nanoid'
/**
 * ID 生成助手：集中管理所有 Record ID 的生成
 * 使用 nanoid 生成分布式安全的 ID
 *
 * 所有方法都是纯函数，无副作用，支持函数式编程
 */
const IdGeneratorHelper = {
  generateRunId: (): string => `run_${nanoid()}`,

  generateCharacterId: (): string => `char_${nanoid()}`,

  generateRelicRecordId: (): string => `relic_${nanoid()}`,

  generateAffixRecordId: (): string => `affix_${nanoid()}`,

  generateUltimateRecordId: (): string => `ult_${nanoid()}`,

  generateRecordIds: (prefix: string, count: number): string[] => {
    return Array.from({ length: count }, () => `${prefix}_${nanoid()}`)
  },

  generateRelicRecordIds: (count: number): string[] => {
    return Array.from({ length: count }, () => `relic_${nanoid()}`)
  },

  generateAffixRecordIds: (count: number): string[] => {
    return Array.from({ length: count }, () => `affix_${nanoid()}`)
  },
}
export { IdGeneratorHelper }
