import { nanoid } from 'nanoid'
/**
 * ID 生成助手：集中管理所有 Record ID 的生成
 * 使用 nanoid 生成分布式安全的 ID
 *
 * 所有方法都是纯函数，无副作用，支持函数式编程
 */
const IdGeneratorHelper = {
  /** 生成 Run ID: `run_{nanoid}` */
  generateRunId: (): string => `run_${nanoid()}`,
  /** 生成 Character Record ID: `char_{nanoid}` */
  generateCharacterId: (): string => `char_${nanoid()}`,
  /** 生成 Relic Record ID: `relic_{nanoid}` */
  generateRelicRecordId: (): string => `relic_${nanoid()}`,
  /** 生成 Affix Record ID: `affix_{nanoid}` */
  generateAffixRecordId: (): string => `affix_${nanoid()}`,
  /** 生成 Ultimate Record ID: `ult_{nanoid}` */
  generateUltimateRecordId: (): string => `ult_${nanoid()}`,
  /** 批量生成指定前缀的 ID */
  generateRecordIds: (prefix: string, count: number): string[] => {
    return Array.from({ length: count }, () => `${prefix}_${nanoid()}`)
  },
  /** 批量生成 Relic Record ID */
  generateRelicRecordIds: (count: number): string[] => {
    return Array.from({ length: count }, () => `relic_${nanoid()}`)
  },
  /** 批量生成 Affix Record ID */
  generateAffixRecordIds: (count: number): string[] => {
    return Array.from({ length: count }, () => `affix_${nanoid()}`)
  },
}
export { IdGeneratorHelper }
