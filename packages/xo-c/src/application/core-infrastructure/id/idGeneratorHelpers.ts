import { nanoid } from 'nanoid'
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
