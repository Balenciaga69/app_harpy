import { BaseInstanceFields, WithSourceUnit, WithCreatedAt } from '../../shared/models/BaseInstanceFields'
/** 詞綴實例，代表附著在物品上的特定詞綴效果與其創建時間 */
export interface AffixInstance extends BaseInstanceFields, WithSourceUnit, WithCreatedAt {}
